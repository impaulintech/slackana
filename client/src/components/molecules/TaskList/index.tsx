import moment from 'moment'
import { Menu } from '@headlessui/react'
import { useRouter } from 'next/router'
import ReactTooltip from 'react-tooltip'
import ReactDatePicker from 'react-datepicker'
import ReactTextareaAutosize from 'react-textarea-autosize'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { BsCheckCircle, BsCheckCircleFill } from 'react-icons/bs'
import { Calendar, Search, User, MoreHorizontal, Edit3, Trash, Eye } from 'react-feather'

import PeopleList from '../PeopeList'
import { classNames } from '~/helpers/classNames'
import Tooltip from '~/components/templates/Tooltip'
import { useTaskMethods } from '~/hooks/taskMethods'
import DialogBox from '~/components/templates/DialogBox'
import { useMemberMethods } from '~/hooks/memberMethods'
import { useProjectMethods } from '~/hooks/projectMethods'
import MenuTransition from '~/components/templates/MenuTransition'
import handleImageError from '~/helpers/handleImageError'

type Props = {
  task: any
  provided: any
  snapshot: any
  isTaskSliderOpen: any
  updateTaskSliderAssignee: any
  updateTaskSliderDueDate: any
  isTaskSliderCompleted: any
  taskID: any
  actions: {
    setIsTaskSliderOpen: (e: any) => void
    setTaskID: (e: any) => void
    setUpdateTaskSliderAssignee: (e: any) => void
    setUpdateTaskSliderDueDate: (e: any) => void
    setIsTaskSliderCompleted: (e: any) => void
    handleRemoveTask: (section_id: any, task_id: any) => void
  }
}

const TaskList: React.FC<Props> = (props): JSX.Element => {
  const {
    task,
    provided,
    snapshot,
    isTaskSliderOpen,
    updateTaskSliderAssignee,
    updateTaskSliderDueDate,
    isTaskSliderCompleted,
    taskID,
    actions: {
      handleRemoveTask,
      setIsTaskSliderOpen,
      setTaskID,
      setIsTaskSliderCompleted,
      setUpdateTaskSliderAssignee,
      setUpdateTaskSliderDueDate
    }
  } = props
  const router = useRouter()
  const { id } = router.query
  const inputElement = useRef<any>()
  const [selectedDueDate, setSelectedDueDate] = useState<any>(null)
  const [dueDate, setDueDate] = useState<any>(null)
  const { members, isMemberLoading, filterMembersName } = useMemberMethods(parseInt(id as string))
  const [updateAssigneeModal, setUpdateAssigneeModal] = useState<boolean>(false)
  const [updateAssignee, setUpdateAssignee] = useState<any>(null)
  const { permissions, canComplete } = useProjectMethods(parseInt(id as string))
  const [isTaskCompleted, setIsTaskCompleted] = useState<any>(false)
  const [taskName, setTaskName] = useState<any>('')
  const {
    useHandleUpdateTaskDueDate,
    useHandleUpdateTaskAssignee,
    useHandleCompleteTask,
    useHandleUpdateTaskName,
    useHandleUpdateTaskAssigneeInSections,
    useHandleUpdateTaskDueDateInSections,
    useHandleUpdateTaskStatusInSections
  } = useTaskMethods(parseInt(id as string))

  const { task_id } = router.query

  const handleUpdateAssigneeToggle = () => {
    if (!permissions?.assignTask) return
    setUpdateAssigneeModal(!updateAssigneeModal)
    filterMembersName(parseInt(id as string), '')
  }
  const handleSetAssignee = (id: number) => {
    const getMember = members.find((member: any) => member.id === id)
    setUpdateAssignee(getMember)
    useHandleUpdateTaskAssigneeInSections(task?.section_id, task?.id, getMember)
    useHandleUpdateTaskAssignee(task?.id, getMember.id)
    handleUpdateAssigneeToggle()
  }

  useEffect(() => {
    setUpdateAssignee(task?.assignee)
    setDueDate(task?.due_date)
    setSelectedDueDate(task?.due_date ? new Date(task?.due_date) : null)
    setIsTaskCompleted(task?.is_completed)
    setTaskName(task?.name)
  }, [task])

  useEffect(() => {
    if (isTaskSliderOpen && parseInt(taskID) === parseInt(task?.id)) {
      setUpdateAssignee(updateTaskSliderAssignee)
      setDueDate(updateTaskSliderDueDate)
      setSelectedDueDate(updateTaskSliderDueDate ? new Date(updateTaskSliderDueDate) : null)
      setIsTaskCompleted(isTaskSliderCompleted)
    }
  }, [
    setIsTaskSliderOpen,
    updateTaskSliderAssignee,
    updateTaskSliderDueDate,
    isTaskSliderCompleted,
    taskID
  ])

  const handleSetDueDate = (date: Date) => {
    let value = date ? moment(new Date(date)).format('YYYY-MM-DD') : null
    useHandleUpdateTaskDueDateInSections(task?.section_id, task?.id, value)
    setSelectedDueDate(date)
    setDueDate(value)
    useHandleUpdateTaskDueDate(task?.id, value)
  }
  const handleTaskStatus = () => {
    useHandleUpdateTaskStatusInSections(task?.section_id, task?.id)
    setIsTaskCompleted(!isTaskCompleted)
    useHandleCompleteTask(task?.id)
  }
  const onSearchChange = (e: any): void => {
    const value = e.target.value
    if (value.length === 0) {
      filterMembersName(parseInt(id as string), value)
    }
  }
  const onSearch = (e: any): void => {
    const value = e.target.value
    const isEnter = e.key === 'Enter' || e.keyCode === 13

    if (!isEnter) return
    filterMembersName(parseInt(id as string), value)
  }

  let isBlur = true
  const [isEditing, setIsEditing] = useState(false)
  const onBlurUpdateTaskName = (e: any) => {
    if (isBlur) {
      setIsEditing(false)
      if (e.target.value.length === 0) {
        return (e.target.value = task?.name)
      }
      if (e.target.value === task?.name) return (inputElement.current.disabled = true)
      useHandleUpdateTaskName(task?.section_id as number, task?.id as number, e.target.value)
      inputElement.current.disabled = true
    }
  }

  const handleUpdateTaskName = (e: any, id: number) => {
    const keyCode = e.which || e.keyCode

    if (keyCode === 13) {
      e.preventDefault()
      setIsEditing(false)
      if (e.target.value === task?.name) return (inputElement.current.disabled = true)
      useHandleUpdateTaskName(task?.section_id as number, task?.id as number, e.target.value)
      isBlur = false
      inputElement.current.disabled = true
    }
  }

  const onClickRenameTask = (): void => {
    setIsEditing(true)
    inputElement.current.disabled = false
    inputElement.current.select()
    inputElement.current.focus()
  }

  const CustomCalendarButton = forwardRef(({ value, onClick }: any, ref: any) => (
    <button
      onClick={onClick}
      ref={ref}
      className={`
          hover:border-slate hover:text-slate-500, flex items-center rounded-full
           border-slate-400 p-0.5 text-slate-400 transition
          duration-75 ease-in-out focus:border-slate-500 focus:text-slate-500 focus:outline-none hover:border-slate-500 hover:bg-white
          ${!value ? 'border-[1.5px] border-dashed' : 'hover:bg-slate-100 '}
        `}
    >
      {value ? (
        <p
          className={`text-xs ${
            new Date(moment(new Date(value)).format('YYYY-MM-DD')) >=
            new Date(moment().format('YYYY-MM-DD'))
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {moment().format('MMM D') === moment(new Date(value)).format('MMM D')
            ? 'Today'
            : moment(new Date(value)).format('MMM D')}
        </p>
      ) : (
        <Calendar className="h-4 w-4" />
      )}
    </button>
  ))

  const addAssigneeComponent = (
    <DialogBox
      isOpen={true}
      closeModal={handleUpdateAssigneeToggle}
      headerTitle="Add Assignee"
      bodyClass="!px-0 !pb-0 mobile:!px-0 !pt-0"
    >
      <div className="flex flex-col">
        <div className="mt-3 flex items-center justify-between border-b px-6 pb-3">
          <div className="flex w-full flex-row items-center rounded-md border border-slate-300 pl-2">
            <Search color="#94A3B8" />
            <input
              type="text"
              onChange={onSearchChange}
              onKeyDown={onSearch}
              className="mr-5 w-full border-none text-slate-900 focus:ring-transparent"
              placeholder="Find members"
            />
          </div>
        </div>
        <div className="mb-3 h-[300px] overflow-y-scroll scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-slate-400 scrollbar-thumb-rounded-md">
          {isMemberLoading ? (
            <PeopleList isLoading={isMemberLoading} />
          ) : members?.length === 0 ? (
            <h1 className="text-px-18 mt-5 text-slate-600 opacity-60">No available data</h1>
          ) : (
            members?.map((member: any) => (
              <MemberList key={member?.id} actions={{ handleSetAssignee }} {...member} />
            ))
          )}
        </div>
      </div>
    </DialogBox>
  )
  let completeTask = !permissions?.setTaskAsCompleted || !canComplete(task?.assignee?.id)
  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps?.style }}
      className={`
        group-task relative flex w-full cursor-pointer flex-col justify-between rounded-md border
        bg-white transition duration-75 ease-in-out focus-within:border-slate-400
      focus:border-slate-400 focus:outline-none focus:ring-slate-400 hover:border-slate-400
      ${snapshot?.isDragging ? 'border-2 border-slate-400' : ''}
       ${isTaskCompleted && 'hover:border-slate-300'}
      `}
    >
      <div className="ml-4 flex items-center">
        <button
          disabled={completeTask}
          onClick={handleTaskStatus}
          className={`
            ${completeTask && 'cursor-not-allowed '}
            absolute top-2.5 bg-white  transition duration-150
            ease-in-out focus:text-green-600 focus:outline-none hover:text-green-600
            ${isTaskCompleted ? 'text-green-600 opacity-60' : 'text-slate-500'}
          `}
        >
          {isTaskCompleted ? (
            <BsCheckCircleFill className="h-4 w-4" />
          ) : (
            <BsCheckCircle className="h-4 w-4" />
          )}
        </button>
        <ReactTextareaAutosize
          className={`
            ml-5 mr-2 flex-1 cursor-pointer select-none resize-none overflow-hidden
            border-none bg-transparent px-0.5 text-sm font-medium focus:ring-0
            ${isTaskCompleted && 'opacity-60'}
          `}
          value={taskName}
          defaultChecked={task?.name}
          disabled={true}
          onFocus={(e) => (isBlur = true)}
          onBlur={onBlurUpdateTaskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={(e) => handleUpdateTaskName(e, task.id)}
          ref={inputElement}
        />
        <div className="absolute right-2 top-2 opacity-0 group-task-hover:opacity-100 group-task-focus:opacity-100">
          {(permissions?.deleteTask || permissions?.renameTask) && !isEditing && (
            <Menu as="div" className="relative z-10 inline-block items-center bg-white text-left">
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`
                    group-task-focus:opacity-100, rounded-lg border p-2 text-slate-600  opacity-0 hover:border-slate-300
                    hover:bg-slate-100 active:scale-95 group-task-hover:opacity-100
                    ${isTaskCompleted ? 'opacity-60' : ''}
                  ${open ? 'border-slate-300 bg-slate-100' : 'border-slate-200'}
              `}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Menu.Button>
                  <MenuTransition>
                    <Menu.Items
                      className={classNames(
                        'absolute right-0 mt-1 w-44 origin-top-right divide-y divide-gray-200 overflow-hidden',
                        'rounded-md border border-slate-200 bg-white py-1 shadow-xl focus:outline-none'
                      )}
                    >
                      <Menu.Item>
                        <button
                          onClick={onClickRenameTask}
                          className={classNames(
                            'flex w-full items-center space-x-3 py-2 px-4 text-sm font-medium text-slate-900',
                            'transition duration-150 ease-in-out hover:bg-slate-100 active:bg-slate-500 active:text-white'
                          )}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit task name
                        </button>
                      </Menu.Item>
                      <div>
                        <Menu.Item>
                          <button
                            onClick={() => handleRemoveTask(task?.section_id, task?.id)}
                            className={classNames(
                              'flex w-full items-center space-x-3 py-2 px-4 text-sm font-medium text-rose-600',
                              'transition duration-150 ease-in-out hover:bg-rose-100 active:bg-rose-600 active:text-white'
                            )}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete task
                          </button>
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </MenuTransition>
                </>
              )}
            </Menu>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between py-2 transition duration-150 ease-in-out">
        <div className="ml-4 flex items-center space-x-2.5">
          <div>
            <ReactTooltip
              place="top"
              type="dark"
              effect="solid"
              id="assignee"
              getContent={(dataTip) => dataTip}
              className="!rounded-lg  !bg-black !text-xs font-semibold"
            />
            {updateAssignee?.user ? (
              <button
                className="overflow-hidden rounded-full"
                onClick={handleUpdateAssigneeToggle}
                data-for="assignee"
                data-tip={!updateAssignee?.user ? `Assignee` : updateAssignee?.user?.name}
              >
                <img
                  src={updateAssignee?.user.avatar.url}
                  onError={(e) => handleImageError(e, '/images/avatar.png')}
                  className="z-10 h-6 w-6 rounded-full"
                />
              </button>
            ) : (
              <button
                data-for="assignee"
                data-tip={!updateAssignee?.user ? `Assignee` : updateAssignee?.user?.name}
                className={`
                  hover:border-slate rounded-full border-[1.5px] border-dashed border-slate-400 p-0.5
                text-slate-400 transition duration-75 ease-in-out focus:border-slate-500
                focus:text-slate-500 focus:outline-none hover:border-slate-500 hover:bg-white hover:text-slate-500
                `}
                onClick={handleUpdateAssigneeToggle}
              >
                <User className="h-4 w-4" />
              </button>
            )}
            {updateAssigneeModal && addAssigneeComponent}
          </div>
          <Tooltip text={!dueDate ? `Due Date` : moment(dueDate).format('MMMM D, YYYY')}>
            <ReactDatePicker
              disabled={!permissions?.assignDueDates}
              selected={selectedDueDate}
              onChange={handleSetDueDate}
              value={dueDate}
              customInput={<CustomCalendarButton />}
              calendarClassName="!shadow-lg"
            />
          </Tooltip>
        </div>
        <div
          className={`
            mr-3.5 opacity-0 group-task-hover:opacity-100 group-task-focus:opacity-100
            ${task_id == task.id && 'opacity-100'}
          `}
        >
          <button
            onClick={() => {
              setIsTaskSliderOpen(true)
              setTaskID(task?.id)
              setUpdateTaskSliderAssignee(updateAssignee)
              setUpdateTaskSliderDueDate(selectedDueDate)
              setIsTaskSliderCompleted(isTaskCompleted)
            }}
            className="rounded-full p-1 text-slate-400 focus:bg-slate-200 focus:text-slate-900 hover:bg-slate-200 hover:text-slate-900 active:scale-95"
          >
            <Eye className="h-4 w-4 outline-none" />
          </button>
        </div>
      </div>
    </div>
  )
}

const MemberList = ({ id, user, actions: { handleSetAssignee } }: any) => {
  return (
    <button
      onClick={() => handleSetAssignee(id)}
      className="block w-full transform px-4 py-2 transition duration-75 ease-in-out hover:bg-slate-200 active:scale-95"
    >
      <div className="flex min-w-[150px] flex-row items-center justify-start gap-3 truncate text-ellipsis mobile:w-[75%]">
        <div className="flex items-center justify-center mobile:min-w-[36px]">
          <img
            src={user?.avatar.url}
            onError={(e) => handleImageError(e, '/images/avatar.png')}
            className="h-8 w-8 rounded-md"
          />
        </div>
        <div className="flex flex-col items-start justify-start">
          <div className="flex flex-row items-center gap-3">
            <p className="text-[16px] font-medium tracking-tighter text-slate-900">{user?.name}</p>
          </div>
        </div>
      </div>
    </button>
  )
}

export default TaskList
