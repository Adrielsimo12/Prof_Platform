export function exportCurrentPage(title = "Document") {
  const previousTitle = document.title;
  document.title = title;

  window.print();

  setTimeout(() => {
    document.title = previousTitle;
  }, 500);
}
