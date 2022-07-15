import React, { useContext } from "react";
import { RecordsContext } from "../context/context";
function Record({ID,First,Last,Birth,Phone,MedicalRecord,ClinicalRecord}){

  //context
  const { setRecordOnFocus} = useContext(RecordsContext);


  function deleteRecord() {
    window.electron.ipcRenderer.deleteRecord([ID,First,Last,Birth]);
  }

  function getRecord(){
    return {
      uniqueID: ID,
      firstName: First,
      lastName: Last,
      birthDate: Birth,
      phone: Phone,
      medicalRecord: MedicalRecord,
      clinicalRecord: ClinicalRecord
    }
  }

  function openRecord() {
    setRecordOnFocus(getRecord);
  }

  return(
    <tr>
      <th scope="row">{ID}</th>
      <td>{First}</td>
      <td>{Last}</td>
      <td>{Birth}</td>
      <td>
        <div className="button-effect" role="group" aria-label="First group">
          <button type="button" className="button openBtn" onClick={openRecord}>Open</button>
          <button type="button" className="button deleteBtn" onClick={deleteRecord} >Delete </button>
        </div>
      </td>
    </tr>

  )
}
export default Record
