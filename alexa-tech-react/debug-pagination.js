// Debug script para verificar la lógica de paginación
const pagination = {
  total: 25,
  page: 2,
  limit: 10,
  pages: 3,
};

const { page, pages } = pagination;
const maxPagesToShow = 5;
let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
let endPage = Math.min(pages, startPage + maxPagesToShow - 1);

if (endPage - startPage + 1 < maxPagesToShow) {
  startPage = Math.max(1, endPage - maxPagesToShow + 1);
}

const pageNumbers = [];
for (let i = startPage; i <= endPage; i++) {
  pageNumbers.push(i);
}

console.log('Pagination data:', pagination);
console.log('Start page:', startPage);
console.log('End page:', endPage);
console.log('Page numbers:', pageNumbers);
console.log('Should include page 2:', pageNumbers.includes(2));