import { LightningElement } from 'lwc';
import findAccounts from '@salesforce/apex/AccountController.findAccounts';

export default class ApexImperativeMethodWithParams extends LightningElement {
    searchName = '';
    searchType = '';
    searchIndustry = '';
    accounts;
    error;

    handleNameChange(event) {
        this.searchName = event.target.value;
    }
    handleTypeChange(event) {
        this.searchType = event.target.value;
    }
    handleIndustryChange(event) {
        this.searchIndustry = event.target.value;
    }

    handleSearch() {
        findAccounts({ searchName: this.searchName, searchType: this.searchType, searchIndustry: this.searchIndustry })
            .then((result) => {
                this.accounts = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.accounts = undefined;
            });
    }
}
