const fadeElements = document.querySelectorAll(
    ".fade-in-left, .fade-in-right"
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.2,

    // この数値を大きくすると、画面に入ってから少し遅れて発火
    rootMargin: "0px 0px -300px 0px"
});

fadeElements.forEach((element) => {
    observer.observe(element);
});

// ここから下は、スクロールに応じて下線が伸びるアニメーションのコードです。

const targets = document.querySelectorAll(".top4");

const observer2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      const delay = entry.target.dataset.delay || 0;

      setTimeout(() => {
        entry.target.classList.add("is-visible");
      }, Number(delay));

      observer2.unobserve(entry.target);
    }
  });
}, {
  threshold: 0,
  rootMargin: "0px 0px -300px 0px"
});

targets.forEach(target => {
  observer2.observe(target);
});