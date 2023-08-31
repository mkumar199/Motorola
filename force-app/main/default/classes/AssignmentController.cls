/*
    *********************************************************
    Apex Class Name    : AssignmentController
    Created Date       : July 29, 2023
    @description       : This is class is used for fetching and inserting Assignment records
    @author            : Magan
    Modification Log:
    Ver   Date         Author                               Modification
    1.0   08-31-2023   Magan                      Initial Version
    *********************************************************
    */

public with sharing class AssignmentController {


    /*
    *********************************************************
    @Method Name    : getAssignmentRecords
    @author         : Magan
    @description    : Method used to fetch Assignment records
    @param          :
    @return         : List<Assignment__c> 
    ********************************************************
    */

    @AuraEnabled(cacheable=true)
    public static List<Assignment__c> getAssignmentRecords(){
        try {
            return [select id,Title__c, DueDate__c, Description__c, Status__c  from Assignment__c order by DueDate__c asc];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /*
    *********************************************************
    @Method Name    : insertAssignmentRecord
    @author         : Magan
    @description    : Method used to insert Assignment records
    @param          : string assignmentRecordJSON
    @return         : Id
    ********************************************************
    */

    @AuraEnabled
    public static Id insertAssignmentRecord(string assignmentRecordJSON){
        try {
            Assignment__c assignRecord = (Assignment__c)JSON.deserialize(
                assignmentRecordJSON,
                Assignment__c.class);
                insert assignRecord;
                return assignRecord.id;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}