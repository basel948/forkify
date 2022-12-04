import View from './view.js';
import icons from '../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      console.log(btn);

      if (!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }
  _generateMarkup() {
    const currPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    // Page 1, and there are other pages
    if (currPage === 1 && numPages > 1) {
      return this.refactorMarkupForward(currPage + 1);
    }
    // last page
    if (currPage === numPages && numPages > 1) {
      return this.refactorMarkupBackward(currPage - 1);
    }
    // other pages
    if (currPage > 1 && currPage < numPages) {
      return `${this.refactorMarkupForward(
        currPage + 1
      )} ${this.refactorMarkupBackward(currPage - 1)}`;
    }
    // page 1, and there NO other pages
    return ``;
  }

  refactorMarkupForward(num) {
    return `
        <button data-goto="${num}" class="btn--inline pagination__btn--next">
            <span>Page ${num}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
    `;
  }
  refactorMarkupBackward(num) {
    return `
        <button data-goto="${num}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${num}</span>
        </button>
    `;
  }
}

export default new PaginationView();
