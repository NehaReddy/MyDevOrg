import { LightningElement ,wire} from 'lwc';
import {gql, graphqL} from 'lightning/uiGraphQLApi'
export default class DatatableWithGraphQL extends LightningElement {
    columns = [
        { label: 'Id', fieldName: 'Id', type: 'text' },
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' }
    ];
    data = [];
    query = '{ contacts { Id, Name, Email } }';
    error;

    @wire(graphqL, {
        query:gql`
        query accRecords{
           uiapi{
                query{
                    Account (first : 50) {
                        edges{
                            node{
                                Id
                                Name{value}
                                AccountNumber{value}
                            }
                        }
                    }
                }
           }
        }
    }`
    })
    propertyOrFunction;
}