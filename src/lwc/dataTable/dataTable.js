import { LightningElement, api, track } from 'lwc';

export default class DataTable extends LightningElement {
    @api keyField;
    @api columns;
    @api pageSize;

    @api 
    get allData() {
        return this._allData;
    }
    set allData(value) {
        this.setAttribute('allData', value);
        this._allData = value;
        this.setup();
    }

    @track _allData;

    displayData = [];
    totalPages = 0;
    pageList = [1];
    currentPageNumber = 1;
    sortedBy;
    sortedDirection;

    setup() {
        if (!this.pageSize) {
            this.pageSize = 10;
        }

        if (this.allData && this.allData.length > 0) {
            this.totalPages = Math.ceil(this.allData.length/this.pageSize);
            if (this.totalPages == 0) {
                this.totalPages = 1;
            }

            this.buildData();
        }
    }

    buildData() {
        var data = [];
        var pageNumber = this.currentPageNumber;
        var x = (pageNumber - 1) * this.pageSize;
        
        for (; x < (pageNumber) * this.pageSize; x++) {
            if (this.allData.length > x) {
                data.push(this.allData[x]);
            }
        }

        this.displayData = data;
        this.generatePageList(pageNumber);
    }

    generatePageList(pageNumber){
        pageNumber = parseInt(pageNumber);
        var pageList = [];
        var totalPage = this.totalPages;
                
        if (pageNumber < 5) {            
            var startPage = 2;
            var count = 0;

            for (var i = startPage; i < totalPage; i++) {
                pageList.push(this.createpageWrapper(i));
                count++;
                
                if (count >= 5) {
                    break;
                }
            }
        } else if (pageNumber > (totalPage - 5)) {
            pageList.push(this.createpageWrapper(totalPage-5), this.createpageWrapper(totalPage-4), this.createpageWrapper(totalPage-3), 
                    this.createpageWrapper(totalPage-2), this.createpageWrapper(totalPage-1));
        } else {
            pageList.push(this.createpageWrapper(pageNumber-2), this.createpageWrapper(pageNumber-1), this.createpageWrapper(pageNumber), 
                    this.createpageWrapper(pageNumber+1), this.createpageWrapper(pageNumber+2));
        }
        
        this.pageList = pageList;
    }

    createpageWrapper(pageNum) {
        return {
            "pageNum" : pageNum,
            "class" : this.currentPageNumber == pageNum
        }
    }

    sortData() {
        var sortedData = this.allData.slice();
        var asc = (this.sortedDirection === 'asc');
        sortedData.sort(this.sortBy(this.sortedBy, asc));
        this.allData = sortedData;
        this.buildData();
    }

    sortBy(field, asc, primer) {
        var key = primer ?
            function(x) {return primer(x[field])} :
            function(x) {return x[field]};

        return function (a, b) {
            var a = key(a) ? key(a) : '';
            var b = key(b) ? key(b) : '';

            // equal items sort equally
            if (a === b) {
                return 0;
            // nulls sort after anything else
            } else if (!a) {
                return 1;
            } else if (!b) {
                return -1;
            // otherwise, if we're ascending, lowest sorts first
            } else if (asc) {
                return a < b ? -1 : 1;
            // if descending, highest sorts first
            } else { 
                return a < b ? 1 : -1;
            }
        };
    }

    updateColumnSorting(event) {
        var fieldName = event.detail.fieldName;
        var sortDirection = event.detail.sortDirection;

        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.sortData();
    }

    onFirst(event) { 
        this.currentPageNumber = 1;
        this.buildData();
    }

    onPrev(event) {
        this.currentPageNumber--;
        this.buildData();
    }

    onNext(event) {
        this.currentPageNumber++;
        this.buildData();
    }

    onLast(event) {
        this.currentPageNumber = this.totalPages;
        this.buildData();
    }

    processMe(event) {
        this.currentPageNumber = parseInt(event.target.name);
        this.buildData();
    }

    get hasMultiplePages() {
        return this.totalPages > 1;
    }

    get isFirstPage() {
        return this.currentPageNumber == 1;
    }

    get isLastPage() {
        return this.currentPageNumber == this.totalPages;
    }

    get firstPageLinkClass() {
        return this.currentPageNumber == 1 ? 'selected' : '';
    }
    
    get lastPageLinkClass() {
        return this.currentPageNumber == this.totalPages ? 'selected' : '';
    }
}