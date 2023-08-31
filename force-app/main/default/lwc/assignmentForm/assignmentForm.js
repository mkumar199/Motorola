import { LightningElement,track ,wire} from 'lwc';
import getAssignments from'@salesforce/apex/AssignmentController.insertAssignmentRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish,createMessageContext } from 'lightning/messageService';
import REFRESHCOMP from "@salesforce/messageChannel/RefreshChannel__c";

export default class AssignmentForm extends LightningElement {
    @track assignmentFormData = {};
    context = createMessageContext();


     saveAssignMentRecord(){
        if(this.isInputValid()){
             getAssignments({assignmentRecordJSON : JSON.stringify(this.assignmentFormData)})
            .then(result => {
                this.toastEventFire('Success',`Record Inserted Successfully !`,'Success','dismissable'); 
                 this.publishMC();
               this.assignmentFormData = {};
            })
            .catch(error => {
                this.toastEventFire('Error',`Something Went Wrong ${error}`,'Error','dismissable');
            });
            
        }
    }

    handleInput(event){
        this.assignmentFormData[event.target.name] = event.target.value;
    }

     /* 
    *   This method is used to check if all the input fields 
    *   that we need to validate are valid or not. We're also going
    *   to populate our contact object so that it can be sent to apex
    *   in order to save the details in salesforce
    */
     isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.inpFld');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity() || inputField.value===null) {
                inputField.reportValidity();
                isValid = false;
            }
            this.assignmentFormData[inputField.name] = inputField.value;
        });
        return isValid;
    }
    get options() {
        return [
            { label: 'Not Started	', value: 'Not Started' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
        ];
    }

    toastEventFire(title, msg, variant, mode) {
        const e = new ShowToastEvent({
            title: title,
            message: msg,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(e);
       
        
    }

    publishMC() {
        const messageToSend = {
            messageToSend: 'Refresh Assignment List',
        };
        publish(this.context, REFRESHCOMP, messageToSend);
    }
}
