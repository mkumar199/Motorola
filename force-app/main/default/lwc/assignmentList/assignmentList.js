import { LightningElement,wire,track } from 'lwc';
import getAssignments from'@salesforce/apex/AssignmentController.getAssignmentRecords';
import {subscribe,createMessageContext } from 'lightning/messageService';
import { refreshApex } from "@salesforce/apex";

import REFRESHCOMP from "@salesforce/messageChannel/RefreshChannel__c";
const columns = [
    { label: 'Title', fieldName: 'Title__c', type: 'text' },
    { label: 'Description', fieldName: 'Description__c', type: 'text' },
    { label: 'Status', fieldName: 'Status__c', type: 'text' },
    { label: 'Due Date', fieldName: 'DueDate__c', type: 'date' }
];

export default class AssignmentList extends LightningElement {
    @track error;
    columns = columns;
    @track assignmentRecords = []; //All records available in the data table
    @track assignmentRecordsToRefresh = [];
    @track totalAssigmentRecords = 0; //Total no.of records
    @track pageSize='5';
    selectpageSize='5'; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1; //Page number   
    subscription=null;
    context = createMessageContext();

    @track assignmentRecordsToDisplay = []; //Records to be displayed on the page
    @track assignmentRecordsToSearch = []; //initial records to display

    @wire (getAssignments)
    getAssignmentRecords(result){
        this.assignmentRecordsToRefresh = result;
		if(result.data) {
			this.assignmentRecords =result.data;
            this.totalAssigmentRecords = result.data.length;
            this.handlePagination();
			this.error = undefined;
		}else if(result.error) {
			this.assignmentRecords =undefined;
			this.error = result.error;
		}
	}

    connectedCallback(){
        this.subscribeMC();
    }

    // function to handle pagination logic
    handlePagination() {
        this.assignmentRecordsToDisplay=[];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalAssigmentRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            if(this.assignmentRecords[i]){
                this.assignmentRecordsToDisplay.push(this.assignmentRecords[i]);
            }
        }
        if(this.assignmentRecordsToDisplay){
            this.assignmentRecordsToSearch = this.assignmentRecordsToDisplay;
        }
    }

    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.handlePagination();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.handlePagination();
    }
    firstPage() {
        this.pageNumber = 1;
        this.handlePagination();
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.handlePagination();
    }
    
    get disableFirst() {
        return this.pageNumber == 1;
    }
    get disableLast() {
        return this.pageNumber == this.totalPages;
    }

    handleRecordsPerPage(event) {
        this.pageSize = event.detail.value;
        this.handlePagination();
    }

    get options() {
        return [
            { label: '5', value: '5' },
            { label: '10', value: '10' },
            { label: '25', value: '25' },
            { label: '50', value: '50'}
        ];
    }

    //function to search Assignment record
    handleAssignSearch(event){
        const searchKey = event.target.value.toLowerCase();
        if (searchKey) {
            this.assignmentRecordsToDisplay = this.assignmentRecordsToSearch;
            if (this.assignmentRecordsToDisplay) {
                this.assignmentRecordsToDisplay = this.assignmentRecordsToDisplay.filter(assign =>   
                    assign.Title__c && assign.Title__c.toLowerCase().includes(searchKey)
            )};
        } else {
          this.assignmentRecordsToDisplay = this.assignmentRecordsToSearch;
        }
    
    }

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, REFRESHCOMP, (messageToSend) => {
           refreshApex(this.assignmentRecordsToRefresh);

        });
     }
    
}