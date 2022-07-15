import React, {createContext, useState} from "react";
import { useRecords } from "../hooks/hooks";


const RecordsContext = createContext();

function RecordsContextProvider({children}) {

  const records = useRecords();

  //STATE
  const [recordOnFocus, setRecordOnFocus] = useState({
    uniqueID: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    medicalRecord: '',
    clinicalRecord: ''
  });


  return (
    <RecordsContext.Provider
      value={
        {
          records:records,
          recordOnFocus:recordOnFocus,
          setRecordOnFocus:setRecordOnFocus

        }
      }
    >
      {children}

    </RecordsContext.Provider>
  )

}

export {RecordsContext, RecordsContextProvider}
