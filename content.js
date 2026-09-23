/**
 * VSCode Zhihu - Content Script Entry Point
 */

(function() {
  // 让知乎浏览器标签页图标与 VS Code 皮肤保持一致。
  window.VSZhihuFavicon?.keepReplaced();

  // Synchronously inject vsc-enabled class and saved theme BEFORE page renders to prevent white flash
  try {
    document.documentElement.classList.add('vsc-enabled');
    const cachedTheme = localStorage.getItem('vsc_theme') || 'dark-plus';
    document.documentElement.setAttribute('data-vsc-theme', cachedTheme);
  } catch(e) {}

  console.log('[VSCode-Zhihu] Content script initialized on:', window.location.href);

  const perf = () => window.VSZhihuPerf;
  const __settingsMark = perf() ? perf().mark('content.getSettings') : null;

  let currentSettings = { enabled: true, theme: localStorage.getItem('vsc_theme') || 'dark-plus', codeViewMode: 'code' };
  let lastPathname = window.location.pathname;

  function runWhenBodyReady(fn) {
    if (document.body) {
      fn();
    } else {
      const bodyObserver = new MutationObserver(() => {
        if (document.body) {
          bodyObserver.disconnect();
          fn();
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
      document.addEventListener('DOMContentLoaded', () => {
        bodyObserver.disconnect();
        if (document.body) fn();
      }, { once: true });
    }
  }

  // Retrieve user settings from background/storage
  try {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
      if (perf() && __settingsMark) perf().end(__settingsMark, 'enabled=' + (settings && settings.enabled));
      if (!chrome.runtime.lastError && settings && settings.enabled !== undefined) {
        currentSettings = Object.assign(currentSettings, settings);
      }
      if (currentSettings.enabled === false) {
        document.documentElement.classList.remove('vsc-enabled');
        document.documentElement.classList.add('vsc-disabled', 'vsc-zhihu-ready');
        try { localStorage.setItem('vsc_enabled', 'false'); } catch(e) {}
      } else {
        document.documentElement.classList.add('vsc-enabled');
        document.documentElement.classList.remove('vsc-disabled');
        try { localStorage.setItem('vsc_enabled', 'true'); } catch(e) {}
        if (currentSettings.theme) {
          document.documentElement.setAttribute('data-vsc-theme', currentSettings.theme);
          try { localStorage.setItem('vsc_theme', currentSettings.theme); } catch(e) {}
        }
        runWhenBodyReady(() => startVSCodeMode(currentSettings));
      }
    });
  } catch(e) {
    runWhenBodyReady(() => startVSCodeMode(currentSettings));
  }

  // Listen for popup settings messages (theme change, boss key, custom code)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'setTheme' && window.VSZhihuUI) {
      window.VSZhihuUI.setTheme(msg.theme);
    } else if (msg.action === 'toggleBossKey' && window.VSZhihuUI) {
      window.VSZhihuUI.toggleBossKey();
    } else if (msg.action === 'updateBossCode' && window.VSZhihuUI) {
      window.VSZhihuUI.customBossCode = msg.code;
      window.VSZhihuUI.createBossScreen();
    } else if (msg.action === 'openCommandPalette' && window.VSZhihuCommandPalette) {
      window.VSZhihuCommandPalette.open();
    }
  });

  function parseCurrentPage(caller) {
    const __mark = perf() ? perf().mark('content.parseCurrentPage') : null;
    if (!window.VSZhihuParser) {
      return { type: 'general', title: document.title, answers: [], feedList: [] };
    }
    const pageType = window.VSZhihuParser.getPageType();
    let data = { type: pageType, title: document.title, answers: [], feedList: [] };

    if (pageType === 'question') {
      data = window.VSZhihuParser.parseQuestionPage();
    } else if (pageType === 'article') {
      data = window.VSZhihuParser.parseArticlePage();
    } else if (pageType === 'hot') {
      data = window.VSZhihuParser.parseHotPage();
    } else {
      data = window.VSZhihuParser.parseFeedPage();
    }

    if (perf() && __mark) {
      perf().end(__mark, 'type=' + pageType + ' answers=' + (data.answers ? data.answers.length : 0) +
        ' feed=' + (data.feedList ? data.feedList.length : 0) + (caller ? ' by=' + caller : ''));
    }
    return data;
  }

  function startVSCodeMode(settings) {
    const __mark = perf() ? perf().mark('content.startVSCodeMode') : null;
    let data = parseCurrentPage('start');

    // Initialize UI engine
    if (window.VSZhihuUI) {
      window.VSZhihuUI.init(settings, data);
    }

    // Reveal the VS Code overlay (hidden since document_start to prevent flash)
    document.documentElement.classList.add('vsc-zhihu-ready');
    if (perf() && __mark) perf().end(__mark, 'type=' + data.type);

    // Cheap DOM signature for observer short-circuit (pathname + card count).
    function computeDomSig() {
      const cards = document.querySelectorAll(
        '.List-item, .AnswerCard, .AnswerItem, .ContentItem, .Post-Main, .ArticleItem'
      ).length;
      return window.location.pathname + '#' + cards;
    }
    let lastDomSig = computeDomSig();

    // Dynamic retry polling for delayed React hydration (up to 30 seconds)
    let retryCount = 0;
    const __retryMark = perf() ? perf().mark('content.retryInterval') : null;
    const retryInterval = setInterval(() => {
      retryCount++;
      const __tickMark = perf() ? perf().mark('content.retryTick') : null;
      const refreshedData = parseCurrentPage('retry');
      const hasContent = (refreshedData.feedList && refreshedData.feedList.length > 0) || (refreshedData.answers && refreshedData.answers.length > 0);

      if (hasContent) {
        if (window.VSZhihuUI) {
          window.VSZhihuUI.parsedData = refreshedData;
          const mainTab = window.VSZhihuUI.tabs?.find(t => t.id === 'tab-main');
          if (mainTab) {
            mainTab.parsedData = refreshedData;
            mainTab.formattedCode = window.VSZhihuParser ? window.VSZhihuParser.formatAsTypeScript(refreshedData) : '';
            mainTab.title = window.VSZhihuParser ? window.VSZhihuParser.getFileName(refreshedData, mainTab.url) : mainTab.title;
          }
          window.VSZhihuUI.createAppRoot('retry-found-content');
        }
        lastDomSig = computeDomSig();
        clearInterval(retryInterval);
        if (perf() && __retryMark) perf().end(__retryMark, 'foundAtTick=' + retryCount);
      } else if (retryCount >= 100) {
        clearInterval(retryInterval);
        if (perf() && __retryMark) perf().end(__retryMark, 'timeout atTick=' + retryCount);
      }
      if (perf() && __tickMark && retryCount % 10 === 0) {
        perf().end(__tickMark, 'tick=' + retryCount);
      }
    }, 300);

    function hasRenderableContent(parsed) {
      if (!parsed) return false;
      if (parsed.answers && parsed.answers.length > 0) return true;
      if (parsed.feedList && parsed.feedList.length > 0) return true;
      return false;
    }

    function applyParsedData(parsed, reason) {
      if (!window.VSZhihuUI || !parsed) return;

      // C: never let an empty parse wipe existing content on the same path.
      const isPathChange = reason === 'spaPathChange' || reason === 'pathChange' || reason === 'pathChangePartial';
      if (!isPathChange && !hasRenderableContent(parsed) && hasRenderableContent(window.VSZhihuUI.parsedData)) {
        if (perf()) perf().log('applyParsedData skip-empty reason=' + (reason || 'apply'));
        return;
      }

      const __mark = perf() ? perf().mark('content.applyParsedData') : null;
      window.VSZhihuUI.parsedData = parsed;
      const mainTab = window.VSZhihuUI.tabs?.find(t => t.id === 'tab-main');
      if (mainTab) {
        mainTab.parsedData = parsed;
        mainTab.formattedCode = window.VSZhihuParser ? window.VSZhihuParser.formatAsTypeScript(parsed) : '';
        mainTab.title = window.VSZhihuParser ? window.VSZhihuParser.getFileName(parsed, mainTab.url) || mainTab.title : mainTab.title;
      }
      window.VSZhihuUI.createAppRoot(reason || 'applyParsedData');
      lastDomSig = computeDomSig();
      if (perf() && __mark) perf().end(__mark, 'reason=' + (reason || 'apply') + ' answers=' + (parsed.answers ? parsed.answers.length : 0));
    }

    function retryParseAfterPathChange(pathAtChange) {
      let tries = 0;
      const __mark = perf() ? perf().mark('content.retryParseAfterPathChange') : null;
      const timer = setInterval(() => {
        if (window.location.pathname !== pathAtChange) {
          clearInterval(timer);
          if (perf() && __mark) perf().end(__mark, 'aborted path changed atTry=' + tries);
          return;
        }
        tries++;
        const parsed = parseCurrentPage('pathChangeRetry');
        if (hasRenderableContent(parsed) || tries >= 40) {
          applyParsedData(parsed, 'pathChange');
          clearInterval(timer);
          if (perf() && __mark) perf().end(__mark, 'done atTry=' + tries + ' content=' + hasRenderableContent(parsed));
          return;
        }
        if (tries % 5 === 0) {
          applyParsedData(parsed, 'pathChangePartial');
        }
      }, 300);
    }

    // B: ignore mutations that only touch our own UI shells.
    function isOurUiNode(node) {
      if (!node || node.nodeType !== 1) return false;
      if (node.id === 'vsc-app-root' || node.id === 'vsc-boss-screen') return true;
      if (node.closest && node.closest('#vsc-app-root, #vsc-boss-screen')) return true;
      return false;
    }

    function isRelevantMutation(m) {
      const t = m.target;
      if (t && t.nodeType === 1 && isOurUiNode(t)) return false;
      if (m.type === 'childList') {
        const changed = [...m.addedNodes, ...m.removedNodes];
        if (changed.length && changed.every(n =>
          (n.nodeType === 1 && (n.id === 'vsc-app-root' || n.id === 'vsc-boss-screen')) ||
          (n.nodeType !== 1 && t && t.nodeType === 1 && isOurUiNode(t))
        )) {
          return false;
        }
      }
      return true;
    }

    // Observe DOM updates & scroll lazy loading
    let updateTimer = null;
    let observerFireCount = 0;
    let observerParseCount = 0;
    let observerSkipCount = 0;
    const observer = new MutationObserver((muts) => {
      if (!muts.some(isRelevantMutation)) return;
      observerFireCount++;
      clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        if (!window.VSZhihuUI) return;
        observerParseCount++;
        const __mark = perf() ? perf().mark('content.observerParse') : null;

        // Detect SPA path change
        if (window.location.pathname !== lastPathname) {
          lastPathname = window.location.pathname;
          data = parseCurrentPage('spaPathChange');
          applyParsedData(data, 'spaPathChange');
          retryParseAfterPathChange(lastPathname);
          lastDomSig = computeDomSig();
          if (perf() && __mark) perf().end(__mark, 'spaNavigate path=' + lastPathname);
          return;
        }

        // B: signature unchanged → skip full parse.
        const sig = computeDomSig();
        if (sig === lastDomSig) {
          observerSkipCount++;
          if (perf() && __mark) {
            perf().end(__mark, 'skip-sig fireN=' + observerFireCount + ' parseN=' + observerParseCount + ' skipN=' + observerSkipCount);
          }
          return;
        }

        const currentParsed = window.VSZhihuUI?.parsedData || {};
        const newData = parseCurrentPage('observer');
        const itemCountChanged = (newData.answers?.length !== currentParsed.answers?.length) ||
                                 (newData.feedList?.length !== currentParsed.feedList?.length);

        if (newData && itemCountChanged && window.VSZhihuUI) {
          applyParsedData(newData, 'observerCountChange');
        } else {
          lastDomSig = sig;
        }
        if (perf() && __mark) {
          perf().end(__mark, 'changed=' + itemCountChanged +
            ' fireN=' + observerFireCount + ' parseN=' + observerParseCount + ' skipN=' + observerSkipCount +
            ' answers=' + (newData.answers ? newData.answers.length : 0) +
            ' feed=' + (newData.feedList ? newData.feedList.length : 0));
        }
      }, 250);
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
})();
