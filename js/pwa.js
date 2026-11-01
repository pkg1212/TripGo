if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => console.log('SW 등록 성공:', reg.scope))
      .catch((err) => console.error('SW 등록 실패:', err));
  });
}