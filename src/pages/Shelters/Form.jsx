import {
    IonPage,
    IonList,
    IonItem,
    IonLabel,
    IonContent,
    IonButton,
    IonDatetime,
    IonCardContent,
    IonCard
  } from '@ionic/react'
import React from 'react'

import { dataContext } from '../../contexts/DataContext'
import { appContext } from '../../contexts/AppContext'
import { useParams } from 'react-router-dom'
import Title from '../../components/Title'
import './Shelters.css'

const ShelterForm = () => {
  const {shelter_id} = useParams()
  const [shelter, setShelter] = React.useState([])
  const { callApi, unsetLocalCache } = React.useContext(dataContext)
  const { showMessage } = React.useContext(appContext)
  const [shelterData, setShelterData] = React.useState({})

  React.useEffect(() => {
    async function fetchData() {
      const data = await callApi({
        graphql: `{
            center(id:${shelter_id}){
              name class_starts_on
            }
          }`})
      setShelter(data)
    }
    fetchData()}, [shelter_id])

    const updateField = (e) => {
        setShelterData({ ...shelterData, [e.target.name]: e.target.value })
    }

    const saveStartsOn = (e) => {
      e.preventDefault()

      if(!shelterData.class_starts_on) {
        showMessage('Please enter a valid date')
        return
      }

      callApi({
        url: `/centers/${shelter_id}`,
        method: 'post',
        params: shelterData
      }).then(() => {
        showMessage('Saved class date successfully')
        unsetLocalCache(`shelter_view_${shelter_id}`)
      })
    }
  
  return (
    <IonPage>
      <Title
        name={`Edit ${shelter.name}`}
        back={`/shelters/${shelter_id}`}
      />
      <IonContent className="dark">
        <IonCard>
          <IonCardContent>
        <form onSubmit={saveStartsOn}>
          <IonList>
            <IonItem>
              <IonLabel position = "stacked" >Class Starts On: </IonLabel>
              <IonDatetime
                className="dark"
                displayFormat="D MMM YYYY"
                mode="md"
                min="2021"
                position = "stacked"
                value={shelterData.class_starts_on}
                name="class_starts_on"
                required
                placeholder="Enter Starting Date"
                onIonChange={updateField}
              ></IonDatetime>
            </IonItem>
            <IonItem>
                <IonButton type="submit">Save Shelter Details</IonButton>
              </IonItem>
          </IonList>
        </form>
        </IonCardContent>
        </IonCard> 
      </IonContent>
    </IonPage>
  )
}

export default ShelterForm