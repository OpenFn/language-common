import { create } from '../language-salesforce/src/FakeAdaptor'
import { execute, each, fields, field, dataValue, dataPath, lastReferenceValue, merge, beta } from './src'

const data = {
  "token": "",
  "formVersion": "",
  "formId": "Registration_Training_Attendance_v2",
  "data": [
    {
      "training_type": "induction",
      "today": "2016-03-29",
      "new_agents": "yes",
      "leader": "8904064471856",
      "instanceID": "uuid:27b7418c-b4cf-4a82-8f77-e515dcb2265f",
      "event_type": "training",
      "date": "2016-03-29",
      "attendee_new": [
        {
          "new_attendee_phone": 58564585,
          "new_attendee_last_name": "Test3",
          "new_attendee_id": "850006000012",
          "new_attendee_first_name": "Test3"
        },
        {
          "new_attendee_phone": 554255262,
          "new_attendee_last_name": "Test5",
          "new_attendee_id": "0110614141000415",
          "new_attendee_first_name": "Test5"
        }
      ],
      "attendee": [
        {
          "late": "no",
          "attendee_phone": null,
          "attendee_last_name": null,
          "attendee_id": "8904064471856",
          "attendee_first_name": null
        },
        {
          "late": "no",
          "attendee_phone": null,
          "attendee_last_name": null,
          "attendee_id": "00001234560000000018",
          "attendee_first_name": null
        }
      ],
      "*meta-ui-version*": null,
      "*meta-submission-date*": "2016-03-29T12:03:54.000Z",
      "*meta-model-version*": null,
      "*meta-is-complete*": true,
      "*meta-instance-id*": "uuid:27b7418c-b4cf-4a82-8f77-e515dcb2265f",
      "*meta-date-marked-as-complete*": "2016-03-29T12:03:54.000Z"
    }
  ],
  "content": "record"
};

const result = execute(
  beta.each(
    "$.data.data[*]",
    create("ODK__c", fields(
      field("Event_Type__c", dataValue("event_type")),
      field("Training_Type__c", dataValue("training_type")),
      field("Event_Leader_ID__c", dataValue("leader")),
      field("Event_Date__c", dataValue("date")),
      field("metainstanceid__c", dataValue("*meta-instance-id*"))
    ))
  ),

  beta.each(
    merge(dataPath("[*].attendee_new[*]"), fields(
      field("parentId", lastReferenceValue("id"))
    )),
    create("ODK_Child_2__c", fields(
      field("ODK__c", dataValue("parentId")),
      field("Barcode__c", dataValue("new_attendee_id")),
      field("First_Name__c", dataValue("new_attendee_first_name")),
      field("Last_Name__c", dataValue("new_attendee_last_name")),
      field("Phone_Number__c", dataValue("new_attendee_phone"))
    ))
  ),

  beta.each(
    merge(dataPath("[*].attendee[*]"), fields(
      field("parentId", function(state){return state.references[state.references.length-1].id}) //gets the sfID of the 1st item created
    )),
    create("ODK_Child_1__c", fields(
      field("ODK__c", dataValue("parentId")),
      field("Barcode__c", dataValue("attendee_id")),
      field("Late__c", dataValue("late"))
    ))
  )

)({
  data, references: [],
  logger: {
    info: console.info.bind(console),
    debug: console.log.bind(console)
  },

}).then((state) => {
  console.log('done');
  console.log(JSON.stringify(state, null, 2));

}).catch((err) => {
  console.log(err);
  throw err;
})

// console.log(result);
