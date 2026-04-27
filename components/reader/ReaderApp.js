'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './ReaderApp.module.css';

const TOTAL_PAGES = 12;

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function getSpread(page, mode) {
  if (mode === 'single') return [page, null];
  if (page <= 1) return [1, null];
  const left = page % 2 === 0 ? page : page - 1;
  return [left, left + 1 <= TOTAL_PAGES ? left + 1 : null];
}

export default function ReaderApp() {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState('spread');
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState('height');
  const [uiVisible, setUiVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [left, right] = useMemo(() => getSpread(page, mode), [page, mode]);

  useEffect(() => {
    let timer;
    const awaken = () => {
      setUiVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setUiVisible(false), 1500);
    };

    ['mousemove', 'keydown', 'click', 'touchstart'].forEach((name) => {
      window.addEventListener(name, awaken, { passive: true });
    });

    awaken();

    return () => {
      clearTimeout(timer);
      ['mousemove', 'keydown', 'click', 'touchstart'].forEach((name) => {
        window.removeEventListener(name, awaken);
      });
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        setPage((p) => clamp(p + (mode === 'spread' ? 2 : 1), 1, TOTAL_PAGES));
      }

      if (event.key === 'ArrowLeft' || (event.shiftKey && event.key === ' ')) {
        event.preventDefault();
        setPage((p) => clamp(p - (mode === 'spread' ? 2 : 1), 1, TOTAL_PAGES));
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }
    };

    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [mode]);

  const pageStatus = mode === 'spread' && right ? `${left}–${right} / ${TOTAL_PAGES}` : `${left} / ${TOTAL_PAGES}`;

  return (
    <div className={`${styles.shell} ${uiVisible ? '' : styles.hidden}`}>
      <header className={`${styles.topbar} ${styles.uiLayer}`}>
        <button className={styles.btn} onClick={() => history.back()}>← 返回</button>
        <div className={styles.titleWrap}>
          <strong>西游记：三打白骨精</strong>
          <small>连环画阅读器</small>
        </div>
        <div className={styles.controls}>
          <button className={styles.btn} onClick={() => setMode((m) => m === 'spread' ? 'single' : 'spread')}>{mode === 'spread' ? '双页' : '单页'}</button>
          <button className={styles.btn} onClick={() => setFit('width')}>适应宽度</button>
          <button className={styles.btn} onClick={() => setFit('height')}>适应高度</button>
          <button className={styles.btn} onClick={() => setZoom((z) => clamp(z - 10, 50, 250))}>-</button>
          <button className={styles.btn} onClick={() => setZoom(100)}>100%</button>
          <button className={styles.btn} onClick={() => setZoom((z) => clamp(z + 10, 50, 250))}>+</button>
          <button className={styles.btn} onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen()}>全屏 (F)</button>
        </div>
      </header>

      <main className={styles.canvas}>
        <div className={`${styles.hotzone} ${styles.left}`} onClick={() => setPage((p) => clamp(p - (mode === 'spread' ? 2 : 1), 1, TOTAL_PAGES))} />
        <div className={`${styles.hotzone} ${styles.center}`} onClick={() => setUiVisible((v) => !v)} />
        <div className={`${styles.hotzone} ${styles.right}`} onClick={() => setPage((p) => clamp(p + (mode === 'spread' ? 2 : 1), 1, TOTAL_PAGES))} />

        <section className={`${styles.spread} ${mode === 'single' ? styles.single : ''} ${fit === 'width' ? styles.fitWidth : styles.fitHeight}`}>
          <article className={styles.paper}>
            <div className={styles.pageImageWrap} style={{ transform: `scale(${zoom / 100})` }}>
              <div className={styles.pageImage} role="img" aria-label={`第${left}页示意图`}>
                <span className={styles.pageWatermark}>连环画 · 第 {left} 页</span>
              </div>
            </div>
            <span className={styles.pageNum}>第 {left} 页</span>
          </article>

          {right ? (
            <article className={styles.paper}>
              <div className={styles.pageImageWrap} style={{ transform: `scale(${zoom / 100})` }}>
                <div className={styles.pageImage} role="img" aria-label={`第${right}页示意图`}>
                  <span className={styles.pageWatermark}>连环画 · 第 {right} 页</span>
                </div>
              </div>
              <span className={styles.pageNum}>第 {right} 页</span>
            </article>
          ) : null}
        </section>
      </main>

      <footer className={`${styles.toolbar} ${styles.uiLayer}`}>
        <div className={styles.pageStatus}>{pageStatus}</div>
        <input className={styles.range} type="range" min={1} max={TOTAL_PAGES} value={page} onChange={(e) => setPage(Number(e.target.value))} />
        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => setPage((p) => clamp(p - (mode === 'spread' ? 2 : 1), 1, TOTAL_PAGES))}>上一页</button>
          <button className={styles.btn} onClick={() => setPage((p) => clamp(p + (mode === 'spread' ? 2 : 1), 1, TOTAL_PAGES))}>下一页</button>
          <span className={styles.zoomLabel}>{zoom}%</span>
        </div>
      </footer>

      {!isFullscreen ? (
        <aside className={`${styles.recommend} ${styles.uiLayer}`}>
          <h3>推荐阅读</h3>
          <div className={styles.cards}>
            <div className={styles.card}>水浒传·景阳冈</div>
            <div className={styles.card}>岳飞传·朱仙镇</div>
            <div className={styles.card}>封神演义·哪吒闹海</div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
