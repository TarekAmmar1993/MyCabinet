import React, { useContext, useEffect, useState } from "react";
import Record from "../components/Record";
import { RecordsContext } from "../context/context";
import TextField from "@material-ui/core/TextField";
import { InputAdornment  } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";

const Records = () => {
//context
  const { records } = useContext(RecordsContext);

  // STATE
  const [firstNameInputText, setFirstNameInputText] = useState("");
  const [lastNameInputText, setLastNameInputText] = useState("");
  const [searchDate, setSearchDate] = React.useState("");
  const [sort, setSort] = React.useState("");
  const [patients, setPatients] = React.useState(records);

 // Effect
  useEffect(() => {

    if (sort === "ascFirstName") {
      const sortedPatients = [...patients].sort((a, b) =>
        a.firstName > b.firstName ? 1 : -1
      );
      setPatients(sortedPatients);
    } else if (sort === "descFirstName") {
      const sortedPatients = [...patients].sort((a, b) =>
        a.firstName < b.firstName ? 1 : -1
      );

      setPatients(sortedPatients);
    } else if (sort === "ascLastName") {
      const sortedPatients = [...patients].sort((a, b) =>
        a.lastName > b.lastName ? 1 : -1
      );

      setPatients(sortedPatients);
    } else if (sort === "descLastName") {
      const sortedPatients = [...patients].sort((a, b) =>
        a.lastName < b.lastName ? 1 : -1
      );

      setPatients(sortedPatients);
    }

  }, [sort]);



  function openAddPatientWindow() {
    window.electron.ipcRenderer.openAddPatientWindow();
  }
  let firstNameInputHandler = (e) => {
    //convert input text to lower case
    let lowerCase = e.target.value.toLowerCase();
    setFirstNameInputText(lowerCase);
  };
  let lastNameInputHandler = (e) => {
    //convert input text to lower case
    let lowerCase = e.target.value.toLowerCase();
    setLastNameInputText(lowerCase);
  };


   const filteredData = patients.filter((record) => {
    if (firstNameInputText === "") {
      return record;
    } else if (record.firstName.toLowerCase().includes(firstNameInputText)) {
      return record;
    }
  }).filter((record) => {
    if (lastNameInputText === "") {
      return record;
    } else if (record.lastName.toLowerCase().includes(lastNameInputText)) {
      return record;
    }
  }).filter((record)=>{
     if (searchDate === ""){
       return record
     }  else if(record.birthDate === searchDate){
       return record
     }
  });



  function filterByDate(date) {
    let formattedDate = moment(date).format( "YYYY-MM-DD");
    setSearchDate(formattedDate);
  }

  function sortAscFirstName() {
    setSort("ascFirstName");
  }

  function sortDescFirstName() {
    setSort("descFirstName");
  }

  function sortAscLastName() {
    setSort("ascLastName");
  }

  function sortDescLastName() {
    setSort("descLastName");
  }

  return (
    <div>
      <div className="records_actionBar">
        <div className='addPatientDiv'>
          <button className="add_btn" onClick={openAddPatientWindow}>Add Patient +</button>
        </div>

        <div className='sortFilterDiv'>
          <div className='allButtonsDiv'>
            <div className="btn-group">
              <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" id='sortButton'>
                Sorting
              </button>
              <ul className="dropdown-menu" role="menu">
                <li >
                  <span className="sortIcon">
                    <i className="fa fa-sort-alpha-asc fa-2x"></i>
                  </span>
                  <span>
                    <a onClick={sortAscFirstName}>First Name Asc </a>
                  </span>
                </li>
                <li >
                  <span className="sortIcon">
                    <i className="fa fa-sort-alpha-desc fa-2x"></i>
                  </span>
                  <span>
                    <a onClick={sortDescFirstName}>First Name Desc </a>
                  </span>
                </li>
                <li >
                  <span className="sortIcon">
                    <i className="fa fa-sort-alpha-asc fa-2x"></i>
                  </span>
                  <span>
                    <a onClick={sortAscLastName}>Last Name Asc </a>
                  </span>
                </li>
                <li >
                  <span className="sortIcon">
                    <i className="fa fa-sort-alpha-desc fa-2x"></i>
                  </span>
                  <span>
                    <a onClick={sortDescLastName}>Last Name Desc </a>
                  </span>
                </li>
              </ul>
            </div>

            <TextField
              className="searchField"
              onChange={firstNameInputHandler}
              placeholder={"Search by First"}
              margin={"normal"}
              InputProps={{
                disableUnderline: true, startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}

            />
            <TextField
              className="searchField"
              onChange={lastNameInputHandler}
              placeholder={"Search by Last"}
              margin={"normal"}
              InputProps={{
                disableUnderline: true, startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <div style={{ margin: "5px" }}>
               <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  className="calendar"
                  label="Birth Date"
                  value={searchDate}
                  inputFormat={"yyyy-MM-dd"}
                  onChange={(newDate) => {
                    filterByDate(newDate);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <table className="table table-success table-striped">
          <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Birth Date</th>
            <th scope="col">Actions</th>
          </tr>
          </thead>
          <tbody>
          {
            filteredData.map(row =>
              <Record
                ID={row.uniqueID}
                First={row.firstName}
                Last={row.lastName}
                Birth={row.birthDate}
                Phone={row.phone}
                MedicalRecord={row.medicalRecord}
                ClinicalRecord={row.clinicalRecord}
              />
            )
          }
          </tbody>
        </table>

      </div>


    </div>

  );
};

export default Records;
