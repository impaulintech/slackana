import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useAppDispatch, useAppSelector } from '~/hooks/reduxSelector'
import {
  addNewTaskInSection,
  getSections,
  removeTaskInSection,
  setSections,
  updateTaskAssigneeInSection,
  updateTaskDueDateInSection,
  updateTaskSectionIDInSection,
  updateTaskStatusInSection
} from '~/redux/section/sectionSlice'
import {
  completeTask,
  createTask,
  getTask,
  removeTask,
  reorderTasks,
  resetRefresher,
  resetUpdateTaskDetailsData,
  setAddNewTaskData,
  setCompleteTaskData,
  setProjectID,
  setRemoveTaskData,
  setSectionID,
  setUpdateTaskAssigneeData,
  setUpdateTaskDetailsData,
  setUpdateTaskDueDateData,
  setUpdateTaskNameData,
  taskRefresher,
  updateTaskAssignee,
  updateTaskDetails,
  updateTaskDueDate,
  updateTaskName,
  updateTaskPosition,
  updateTaskSection
} from '~/redux/task/taskSlice'

export const useTaskMethods = (projectID: number) => {
  const { task } = useAppSelector((state) => state)
  const {
    taskData,
    refresher: { taskUpdate }
  } = task
  const [isTaskLoading, setIsTaskLoading] = useState(false)
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setProjectID({ project_id: projectID }))
  }, [projectID])

  const useHandleCreateTask = async (
    section_id: number,
    data: any,
    callback: () => void
  ): Promise<void> => {
    dispatch(setSectionID({ section_id }))
    dispatch(setAddNewTaskData({ ...data, project_member_id: data.project_member_id?.id }))
    dispatch(
      addNewTaskInSection({
        newTask: {
          id: Math.random(),
          section_id: section_id,
          assignee: data.project_member_id,
          name: data.name,
          description: '',
          is_completed: false,
          position: 0,
          due_date: data.due_date,
          estimated_time: 0,
          actual_time_finished: 0,
          created_at: '',
          updated_at: ''
        }
      })
    )
    callback()
    toast.promise(
      dispatch(createTask()).then((_) => {
        dispatch(reorderTasks()).then((_) => {
          dispatch(getSections())
        })
      }),
      {
        loading: 'Creating task...',
        success: 'Task created successfully!',
        error: 'Error on creating task!'
      }
    )
  }

  const useHandleRemoveTask = async (section_id: number, task_id: number) => {
    dispatch(setSectionID({ section_id }))
    dispatch(setRemoveTaskData({ id: task_id }))
    dispatch(removeTaskInSection({ section_id, task_id }))
    toast.promise(
      dispatch(removeTask()).then((_) => {
        dispatch(reorderTasks())
      }),
      {
        loading: 'Removing task...',
        success: 'Task removed successfully!',
        error: 'Error on removing task!'
      }
    )
  }
  const useHandleReorderTasks = async (section_id: number) => {
    dispatch(setSectionID({ section_id }))
    dispatch(reorderTasks())
  }
  const useHandleUpdateTaskDueDate = async (id: number, due_date: any) => {
    dispatch(setUpdateTaskDueDateData({ id, due_date }))
    toast.promise(dispatch(updateTaskDueDate()), {
      loading: 'Updating task due date...',
      success: 'Task due date updated successfully!',
      error: 'Error on updating task due date!'
    })
  }
  const useHandleUpdateTaskAssignee = async (id: number, project_member_id: any) => {
    dispatch(setUpdateTaskAssigneeData({ id, project_member_id }))
    toast.promise(dispatch(updateTaskAssignee()), {
      loading: 'Updating task assignee...',
      success: 'Task assignee updated successfully!',
      error: 'Error on updating task assignee!'
    })
  }
  const useHandleUpdateTaskName = async (section_id: number, id: number, name: string) => {
    dispatch(setSectionID({ section_id }))
    dispatch(setUpdateTaskNameData({ id, name }))
    toast.promise(
      dispatch(updateTaskName()).then((_) => {
        dispatch(getSections())
      }),
      {
        loading: 'Updating task name...',
        success: 'Task name updated successfully!',
        error: 'Error on updating task name!'
      }
    )
  }
  const useHandleCompleteTask = async (id: number) => {
    dispatch(setCompleteTaskData({ id }))
    dispatch(completeTask())
  }
  const useHandleCompleteTaskSlider = async (id: number) => {
    dispatch(setCompleteTaskData({ id }))
    dispatch(completeTask())
  }
  const useHandleGetTask = async (task_id: number) => {
    setIsTaskLoading(true)
    dispatch(getTask(task_id)).then((_) => {
      setIsTaskLoading(false)
    })
  }
  const useHandleGetTaskWithoutLoading = async (task_id: number) => {
    dispatch(getTask(task_id))
  }
  const useHandleUpdateTaskDetails = async (task_id: number, data: any, callback: () => void) => {
    dispatch(setUpdateTaskDetailsData({ id: task_id, ...data }))
    dispatch(updateTaskDetails()).then((_) => callback())
  }
  const useHandleRefetchTasks = async () => {
    dispatch(getSections())
  }
  const useHandleSetSections = (sections: []) => {
    dispatch(setSections({ sections }))
  }
  const useHandleUpdateTaskSection = (section_id: number, task_id: number) => {
    dispatch(updateTaskSectionIDInSection({ section_id, task_id }))
    dispatch(setSectionID({ section_id }))
    dispatch(updateTaskSection(task_id))
  }
  const useHandleUpdateTaskPosition = (tasks: any) => {
    dispatch(updateTaskPosition(tasks))
  }
  const useHandleUpdateTaskDueDateInSections = (
    section_id: number,
    task_id: number,
    due_date: any
  ) => {
    dispatch(updateTaskDueDateInSection({ section_id, task_id, due_date }))
  }
  const useHandleUpdateTaskAssigneeInSections = (
    section_id: number,
    task_id: number,
    assignee: any
  ) => {
    dispatch(updateTaskAssigneeInSection({ section_id, task_id, assignee }))
  }
  const useHandleUpdateTaskStatusInSections = (section_id: number, task_id: number) => {
    dispatch(updateTaskStatusInSection({ section_id, task_id }))
  }
  return {
    useHandleCreateTask,
    useHandleRemoveTask,
    useHandleReorderTasks,
    useHandleUpdateTaskDueDate,
    useHandleUpdateTaskAssignee,
    useHandleUpdateTaskName,
    useHandleCompleteTask,
    useHandleGetTask,
    useHandleUpdateTaskDetails,
    useHandleRefetchTasks,
    useHandleGetTaskWithoutLoading,
    useHandleCompleteTaskSlider,
    useHandleSetSections,
    useHandleUpdateTaskSection,
    useHandleUpdateTaskPosition,
    useHandleUpdateTaskDueDateInSections,
    useHandleUpdateTaskAssigneeInSections,
    useHandleUpdateTaskStatusInSections,
    taskUpdate,
    isTaskLoading,
    taskData
  }
}
