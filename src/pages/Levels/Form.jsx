import {
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonContent,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonAlert
} from '@ionic/react'
import { pencil, close, trash } from 'ionicons/icons'
import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { PROJECT_IDS } from '../../utils/Constants'

import Title from '../../components/Title'
import { dataContext } from '../../contexts/DataContext'
import { appContext } from '../../contexts/AppContext'

// :TODO: Delete Levels

const LevelForm = () => {
  const { shelter_id, project_id, level_id } = useParams()
  const [level, setLevel] = React.useState({
    level_name: '',
    grade: '5',
    name: 'A',
    project_id: project_id,
    center_id: shelter_id,
    students: [],
    teachers: []
  })
  const [disable, setDisable] = React.useState(true)
  const { callApi, unsetLocalCache, cache } = React.useContext(dataContext)
  const { showMessage } = React.useContext(appContext)
  const [labels, setLabels] = React.useState({
    level: 'Class Section',
    students: 'Students',
    teachers: 'Teachers'
  })
  const [getConfirmation, setGetConfirmation] = React.useState({
    status: false,
    onConfirm: () => {}
  })
  const history = useHistory()

  React.useEffect(() => {
    async function fetchLevel() {
      const level_data = await callApi({
        graphql: `{ 
                level(id: ${level_id}) { 
                    id name grade level_name project_id
                    students {
                        id name
                    }
                    teachers {
                        id name
                    }
                }
            }`,
        cache: true,
        cache_key: `level_${level_id}`
      })

      setLevel(level_data)
    }

    if (project_id == PROJECT_IDS.AFTERCARE) {
      setLabels({ level: 'SSG', students: 'Youth', teachers: 'Wingmen' })
    }

    if (level_id !== '0') {
      if (
        cache[`level_${level_id}`] === undefined ||
        !cache[`level_${level_id}`]
      ) {
        fetchLevel()
      } else {
        setLevel(cache[`level_${level_id}`])
      }
    } else {
      setDisable(false)
      if (project_id == PROJECT_IDS.AFTERCARE) {
        setLevel({ ...level, level_name: 'New SSG', grade: 13 })
      } else {
        setLevel({ ...level, level_name: 'New Class Section' })
      }
    }
  }, [level_id, cache[`level_${level_id}`]])

  const updateField = (e) => {
    setLevel({ ...level, [e.target.name]: e.target.value })
  }

  const savelevel = (e) => {
    e.preventDefault()

    if (project_id == PROJECT_IDS.AFTERCARE) {
      level.grade = 13
    }

    if (level_id !== '0') {
      // Edit
      callApi({
        url: `/levels/${level_id}`,
        method: 'post',
        params: level
      }).then((data) => {
        if (data) {
          showMessage(labels.level + ' updated Successfully', 'success')
          unsetLocalCache(
            `shelter_${shelter_id}_project_${project_id}_level_index`
          )
          unsetLocalCache(`shelter_view_${shelter_id}`)
        }
      })
    } else {
      // Create new level
      callApi({ url: `/levels`, method: 'post', params: level }).then(
        (data) => {
          if (data) {
            data.level_name = data.grade + ' ' + data.name
            data.students = []
            data.teachers = []
            setLevel(data)
            showMessage(labels.level + ' created Successfully', 'success')
            unsetLocalCache(
              `shelter_${shelter_id}_project_${project_id}_level_index`
            )
            unsetLocalCache(`shelter_view_${shelter_id}`)
          }
        }
      )
    }
  }

  const deleteLevel = () => {
    if (level.teachers.length > 0 || level.students.length > 0) {
      showMessage(
        `Please delete all teacher and students assignments from the class section before deleting it.`,
        'error'
      )
      return false
    }
    callApi({
      url: `/levels/${level_id}`,
      method: 'delete'
    }).then(() => {
      unsetLocalCache(`shelter_${shelter_id}_project_${project_id}_level_index`)
      unsetLocalCache(`shelter_view_${shelter_id}`)
      unsetLocalCache(`level_${level_id}`)
      history.push(`/shelters/${shelter_id}/projects/${project_id}/levels`)
      showMessage('Deleted the level')
    })
  }

  const all_grades = ['5', '6', '7', '8', '9', '10', '11', '12', '13']
  const grade_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  return (
    <IonPage>
      <Title
        name={`${labels.level}: ${level.level_name}`}
        back={`/shelters/${shelter_id}/projects/${project_id}/levels`}
      />

      <IonContent class="dark">
        <IonList>
          <form onSubmit={savelevel}>
            {project_id != PROJECT_IDS.AFTERCARE ? (
              <IonItem>
                <IonLabel>Class</IonLabel>
                <IonSelect
                  name="grade"
                  value={level.grade}
                  onIonChange={updateField}
                  disabled={disable}
                >
                  {all_grades.map((grade, index) => {
                    return (
                      <IonSelectOption key={index} value={grade}>
                        {grade === '13' ? 'Aftercare' : grade}
                      </IonSelectOption>
                    )
                  })}
                </IonSelect>
              </IonItem>
            ) : null}

            <IonItem>
              <IonLabel>Section</IonLabel>
              <IonSelect
                name="name"
                value={level.name}
                onIonChange={updateField}
                disabled={disable}
              >
                {grade_names.map((name, index) => {
                  return (
                    <IonSelectOption key={index} value={name}>
                      {name}
                    </IonSelectOption>
                  )
                })}
              </IonSelect>
            </IonItem>
            
            {level_id == '0' ? null : (
              <IonItem>
                <IonButton
                  slot="end"
                  onClick={() => {
                    setGetConfirmation({
                      status: true,
                      onConfirm: () => {
                        deleteLevel()
                      }
                    })
                  }}
                >
                  <IonIcon icon={trash} /> Delete this Class Section
                </IonButton>
              </IonItem>
            )}

            {disable ? null : (
              <IonItem>
                <IonButton type="submit">Save</IonButton>
              </IonItem>
            )}
          </form>

          {level_id != '0' ? (
            <>
              <IonItem class="title">
                <IonLabel>{labels.students}</IonLabel>
              </IonItem>
              {level.students.map((student, index) => {
                return (
                  <IonItem key={index} className="striped">
                    <IonLabel>{student.name}</IonLabel>
                  </IonItem>
                )
              })}

              {disable ? null : (
                <IonItem>
                  <IonButton
                    routerLink={`/shelters/${shelter_id}/projects/${project_id}/levels/${level_id}/add-student`}
                  >
                    Add/Remove {labels.students} from this {labels.level}
                  </IonButton>
                </IonItem>
              )}

              <IonItem class="title">
                <IonLabel>{labels.teachers}</IonLabel>
              </IonItem>
              {level.teachers.map((teacher, index) => {
                return (
                  <IonItem key={index} className="striped">
                    <IonLabel>{teacher.name}</IonLabel>
                  </IonItem>
                )
              })}

              {disable ? null : (
                <IonItem>
                  <IonButton
                    routerLink={`/shelters/${shelter_id}/projects/${project_id}/batch/0/level/${level_id}/view-teachers`}
                  >
                    Edit {labels.teachers} Assignment
                  </IonButton>
                </IonItem>
              )}
            </>
          ) : null}

          {/* Some empty space at the bottom so that the FAB icon does NOT cover things. :UGLY: */}
          <IonItem>
            <IonLabel></IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel></IonLabel>
          </IonItem>
        </IonList>

        <IonAlert
          isOpen={getConfirmation.status}
          onDidDismiss={() => {
            setGetConfirmation({
              status: false,
              onConfirm: getConfirmation.onConfirm
            })
          }}
          header='Are you sure?'
          subHeader='Confirm that you wish to delete this class section'
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                setGetConfirmation({
                  status: false,
                  onConfirm: getConfirmation.onConfirm
                })
              }
            },
            {
              text: 'Delete',
              handler: getConfirmation.onConfirm
            }
          ]}
        />

        {disable ? (
          <IonFab
            onClick={() => {
              setDisable(false)
            }}
            vertical="bottom"
            horizontal="start"
            slot="fixed"
          >
            <IonFabButton>
              <IonIcon icon={pencil} />
            </IonFabButton>
          </IonFab>
        ) : (
          <IonFab
            onClick={() => {
              setDisable(true)
            }}
            vertical="bottom"
            horizontal="start"
            slot="fixed"
          >
            <IonFabButton>
              <IonIcon icon={close} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}

export default LevelForm
