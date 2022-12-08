public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static List<Account> findAccounts(String searchName, String searchType, String searchIndustry){

        String name = '%' + searchName + '%';
        String type = '%' + searchType + '%';
        String industry = '%' + searchIndustry + '%';


// ------------------------------- 文字列連結を使用する場合 -----------------------------------------------------

        String accList = 'SELECT Id,Name,Type,Phone,Website,Industry FROM Account';

        if(name != '%%'){
            accList += ' WHERE Name LIKE :name';
            
            if(type != '%%'){
                accList += ' OR Type LIKE :type';
            }
            if(industry != '%%'){
                accList += ' OR Industry LIKE :industry';
            }

        }else if(name == '%%'){

            if(type != '%%'){
                accList += ' WHERE Type LIKE :type';
                       
                if(industry != '%%'){
                    accList += ' OR Industry LIKE :industry';
                }
            
            }else if(type == '%%'){
                if(industry != '%%'){
                    accList += ' WHERE Industry LIKE :industry';
                }
            }
        }

        accList += ' WITH SECURITY_ENFORCED';

        List<Account> accountList = Database.query(accList);

        return accountList;


// -------------------------------- 文字列を代入する場合 -----------------------------------------------------------

    //     if(name == '%%'){
    //         name = '@@@@@@@@@@@@@@@@@@@@@@@';
    //     }
    //     if(type == '%%'){
    //         type = '@@@@@@@@@@@@@@@@@@@@@@@';
    //     }
    //     if(industry == '%%'){
    //         industry = '@@@@@@@@@@@@@@@@@@@@@@@';
    //     }

    //     return [SELECT Id,Name,Type,Phone,Website,Industry FROM Account 
    //                                  WHERE Name LIKE :name OR
    //                                  Type LIKE :type OR
    //                                  Industry LIKE :industry
    //                                  WITH SECURITY_ENFORCED];
    }
}
