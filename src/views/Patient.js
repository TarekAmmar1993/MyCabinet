import React, { useContext, useState } from "react";
import { RecordsContext } from "../context/context";


function Patient() {
  //context
  const { recordOnFocus } = useContext(RecordsContext);

  //STATE
  const[disabled, setDisabled] = useState(true)


  function printPDF(e) {
    e.preventDefault();
    window.electron.ipcRenderer.printPDF();
  }
  function handleUpdate(e) {
    e.preventDefault();
    setDisabled((disabled)=>!disabled);
    if(!disabled){
      let updatedRecord = {
        uniqueID: recordOnFocus.uniqueID,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        birthDate: document.getElementById('birthDate').value,
        phone: document.getElementById('phone').value,
        medicalRecord: document.getElementById('medicalRecord').value,
        clinicalRecord: document.getElementById('clinicalRecord').value
      }
      window.electron.ipcRenderer.updateRecord(updatedRecord);

    }

  }
  function handleDelete(e) {
    e.preventDefault();
    window.electron.ipcRenderer.deleteRecord([recordOnFocus.uniqueID,recordOnFocus.firstName,recordOnFocus.lastName,recordOnFocus.birthDate]);
  }

  return(
    <div className="FormContainer">
      <div>
        <h2 className="addNewTitle">  Patient</h2>
      </div>
      <form className="row g-3" style={{margin: "10px"}} id="AddNewForm">
        <div className="col-md-6">
          <label className="form-label">First Name</label>
          <input type="text" className="form-control" id="firstName" disabled={disabled} defaultValue={recordOnFocus.firstName}/>
        </div>
        <div className="col-md-6">
          <label className="form-label">Last Name</label>
          <input type="text" className="form-control" id="lastName" disabled={disabled} defaultValue={recordOnFocus.lastName}/>
        </div>
        <div className="col-md-6">
          <label className="form-label">Birth Date</label>
          <input type="date" className="form-control" id="birthDate" disabled={disabled} defaultValue={recordOnFocus.birthDate}/>
        </div>
        <div className="col-md-6">
          <label className="form-label">Phone</label>
          <input type="tel" className="form-control"  id="phone" disabled={disabled} defaultValue={recordOnFocus.phone}/>
        </div>
        <hr/>
        <div className="col-12">
          <label className="form-label" >Medical Record</label>
          <div>
        <textarea rows="5" cols="117" id="medicalRecord" form="AddNewForm" disabled={disabled} defaultValue={recordOnFocus.medicalRecord}>
      </textarea>
          </div>

        </div>
        <hr />
          <div className="col-12">
            <label className="form-label">Clinical Record</label>
            <div>
        <textarea rows="5" cols="117" id="clinicalRecord" form="AddNewForm" disabled={disabled} defaultValue={recordOnFocus.clinicalRecord}>
      </textarea>
            </div>
          </div>

          <div className="col-12" id="buttonSubmitDiv">
            <button  className="btn btn-outline-primary" id="PatientNavButton" onClick={printPDF}> Print</button>
            <button  className="btn btn-outline-success" id="PatientNavButton" onClick={handleUpdate}> {disabled === true? 'Update':'Confirm'}</button>
            <button  className="btn btn-outline-danger" id="PatientNavButton" onClick={handleDelete}> Delete</button>
          </div>
      </form>
    </div>
  );
}

export default Patient;
