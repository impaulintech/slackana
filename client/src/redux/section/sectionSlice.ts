import {
  ActionReducerMapBuilder,
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit'

import { AxiosResponseError, Section } from '~/shared/types'
import { catchError } from '~/utils/handleAxiosError'
import sectionService from './sectionService'

type InitialState = {
  sections: Array<Section>
  project_id: number
  sectionData: {
    id: number
    name: string
  }
  addNewSectionData: {
    name: string
  }
  renameSectionData: {
    id: number
    name: string
  }
  removeSectionData: {
    id: number
  }
  refresher: {
    sectionsStateUpdate: boolean
    sectionUpdate: boolean
  }
  isError: boolean
  isSuccess: boolean
  isLoading: boolean
  error: AxiosResponseError
}

const initialState: InitialState = {
  sections: [],
  project_id: 0,
  sectionData: {
    id: 0,
    name: 'Untitle Section'
  },
  addNewSectionData: {
    name: ''
  },
  renameSectionData: {
    id: 0,
    name: ''
  },
  removeSectionData: {
    id: 0
  },
  refresher: {
    sectionsStateUpdate: false,
    sectionUpdate: false
  },
  isError: false,
  isSuccess: false,
  isLoading: false,
  error: {
    status: 0,
    content: null
  }
}

export const getSections = createAsyncThunk('section/getSectionsStatus', async (_, thunkAPI) => {
  const {
    section: { project_id }
  }: any = thunkAPI.getState()
  try {
    return await sectionService.getSections(project_id)
  } catch (error: any) {
    return thunkAPI.rejectWithValue(catchError(error))
  }
})
export const createSection = createAsyncThunk(
  'section/createSectionsStatus',
  async (_, thunkAPI) => {
    const {
      section: { project_id, addNewSectionData }
    }: any = thunkAPI.getState()
    try {
      return await sectionService.createSection(project_id, addNewSectionData.name)
    } catch (error: any) {
      return thunkAPI.rejectWithValue(catchError(error))
    }
  }
)
export const renameSection = createAsyncThunk(
  'section/renameSectionsStatus',
  async (_, thunkAPI) => {
    const {
      section: {
        project_id,
        renameSectionData: { id, name }
      }
    }: any = thunkAPI.getState()
    try {
      return await sectionService.renameSection({ id, project_id, name })
    } catch (error: any) {
      return thunkAPI.rejectWithValue(catchError(error))
    }
  }
)
export const removeSection = createAsyncThunk(
  'section/removeSectionsStatus',
  async (_, thunkAPI) => {
    const {
      section: {
        project_id,
        removeSectionData: { id }
      }
    }: any = thunkAPI.getState()
    try {
      return await sectionService.removeSection({ id, project_id })
    } catch (error: any) {
      return thunkAPI.rejectWithValue(catchError(error))
    }
  }
)

export const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.error = {
        status: 0,
        content: null
      }
    },
    resetRefresher: (state) => {
      state.refresher.sectionUpdate = false
      state.refresher.sectionsStateUpdate = false
    },
    sectionRefresher: (state) => {
      state.refresher.sectionUpdate = true
    },
    sectionsRefresher: (state) => {
      state.refresher.sectionsStateUpdate = true
    },
    setProjectID: (state, { payload: { project_id } }) => {
      state.project_id = project_id
    },
    setSectionData: (state, { payload: { id, name } }) => {
      state.sectionData.id = id
      state.sectionData.name = name
    },
    setAddNewSectionData: (state, { payload }) => {
      state.addNewSectionData = payload
    },
    setSections: (state, { payload: { sections } }) => {
      state.sections = sections
    },
    addNewTaskInSection: (state, { payload: { newTask } }) => {
      let sections: any[] = state.sections
      let section = state.sections.filter((section) => section.id == newTask.section_id)[0]
      let index = sections.indexOf(section)
      section?.tasks?.unshift(newTask as never)
      sections[index] = section
      state.sections = sections
    },
    removeTaskInSection: (state, { payload: { section_id, task_id } }) => {
      let sections: any[] = state.sections
      let section = state.sections.filter((section) => section.id == section_id)[0]
      let index = sections.indexOf(section)
      let newTasks: any = section?.tasks?.filter((task: any) => task?.id != task_id)
      section.tasks = newTasks
      sections[index] = section
      state.sections = sections
    },
    updateTaskSectionIDInSection: (state, { payload: { section_id, task_id } }) => {
      let sections: any[] = state.sections
      let section = state.sections.filter((section) => section.id == section_id)[0]
      let index = sections.indexOf(section)
      let newTasks: any = section?.tasks?.map((task: any) => {
        if (task?.id == task_id) {
          task.section_id = section_id
        }
        return task
      })
      section.tasks = newTasks
      sections[index] = section
      state.sections = [...sections]
    },
    updateTaskAssigneeInSection: (state, { payload: { section_id, task_id, assignee } }) => {
      let sections: any[] = state.sections
      let section = state.sections.filter((section) => section.id == section_id)[0]
      let index = sections.indexOf(section)
      let newTasks: any = section?.tasks?.map((task: any) => {
        if (task?.id == task_id) {
          task.assignee = assignee
        }
        return task
      })
      section.tasks = newTasks
      sections[index] = section
      state.sections = sections
      state.sections = [...sections]
    },
    updateTaskDueDateInSection: (state, { payload: { section_id, task_id, due_date } }) => {
      let sections: any[] = state.sections
      let section = state.sections.filter((section) => section.id == section_id)[0]
      let index = sections.indexOf(section)
      let newTasks: any = section?.tasks?.map((task: any) => {
        if (task?.id == task_id) {
          task.due_date = due_date
        }
        return task
      })
      section.tasks = newTasks
      sections[index] = section
      state.sections = sections
      state.sections = [...sections]
    },
    updateTaskStatusInSection: (state, { payload: { section_id, task_id } }) => {
      let sections: any[] = state.sections
      let section = state.sections.filter((section) => section.id == section_id)[0]
      let index = sections.indexOf(section)
      let newTasks: any = section?.tasks?.map((task: any) => {
        if (task?.id == task_id) {
          task.is_completed = !task.is_completed
        }
        return task
      })
      section.tasks = newTasks
      sections[index] = section
      state.sections = [...sections]
    },
    setRenameSectionData: (state, { payload }) => {
      state.renameSectionData = payload
    },
    setRemoveSectionData: (state, { payload }) => {
      state.removeSectionData = payload
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<any>) => {
    builder
      // Get Sections
      .addCase(getSections.pending, (state) => {
        state.isLoading = true
        state.sectionsStateUpdate = true
      })
      .addCase(getSections.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.isSuccess = true
        state.sections = [...action.payload]
        state.error = {
          status: 0,
          content: null
        }
      })
      .addCase(getSections.rejected, (state, action: PayloadAction<any>) => {
        state.isError = true
        state.isSuccess = false
        state.isLoading = false
        state.error = action.payload
      })
      // Create Section
      .addCase(createSection.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createSection.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        state.error = {
          status: 0,
          content: null
        }
      })
      .addCase(createSection.rejected, (state, action: PayloadAction<any>) => {
        state.isError = true
        state.isSuccess = false
        state.isLoading = false
        state.error = action.payload
      })
      // Rename Section
      .addCase(renameSection.pending, (state) => {
        state.isLoading = true
        state.sectionUpdate = true
      })
      .addCase(renameSection.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.isSuccess = true
        state.sectionUpdate = false
        state.isError = false
        state.error = {
          status: 0,
          content: null
        }
      })
      .addCase(renameSection.rejected, (state, action: PayloadAction<any>) => {
        state.isError = true
        state.isSuccess = false
        state.sectionUpdate = false
        state.isLoading = false
        state.error = action.payload
      })
      // Remove Section
      .addCase(removeSection.pending, (state) => {
        state.isLoading = true
      })
      .addCase(removeSection.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        state.error = {
          status: 0,
          content: null
        }
      })
      .addCase(removeSection.rejected, (state, action: PayloadAction<any>) => {
        state.isError = true
        state.isSuccess = false
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const {
  reset,
  resetRefresher,
  sectionRefresher,
  sectionsRefresher,
  setProjectID,
  setSectionData,
  setAddNewSectionData,
  setRenameSectionData,
  setRemoveSectionData,
  addNewTaskInSection,
  removeTaskInSection,
  updateTaskSectionIDInSection,
  updateTaskAssigneeInSection,
  updateTaskDueDateInSection,
  updateTaskStatusInSection,
  setSections
} = sectionSlice.actions
export default sectionSlice.reducer
