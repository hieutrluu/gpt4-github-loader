// Develop a TypeScript custom TreeItem component that extends the Material UI TreeItem component and includes a checkbox. This component should be used in the GitHubRepoBrowser component and modify the state of the treeData property for its corresponding select property. The GitHubRepoBrowser component uses an interface called TreeData that has the following properties: path, name, type, select, and children (optional).
// CustomTreeItem.tsx
import React, { ChangeEvent } from 'react'
import { TreeItem } from '@mui/lab'
// import { Folder, InsertDriveFile } from '@mui/icons'
import Checkbox from '@mui/material/Checkbox'
import { Folder, InsertDriveFile } from '@mui/icons-material'
// import { makeStyles } from '@material-ui/core/styles'

// const useStyles = makeStyles({
//   labelRoot: {
//     display: 'flex',
//     alignItems: 'center',
//     padding: 4
//   },
//   labelText: {
//     marginLeft: 4
//   }
// })

interface CustomTreeItemProps {
  nodeId: string
  label: string
  type: string
  onCheck: (nodeId: string, checked: boolean) => void
}

const CustomTreeItem: React.FC<CustomTreeItemProps> = ({
  nodeId,
  label,
  type,
  onCheck,
  ...other
}) => {
  //   const classes = useStyles()
  const [checked, setChecked] = React.useState(false)

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    setChecked(isChecked)
    onCheck(nodeId, isChecked)
  }

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <div>
          <Checkbox
            edge="start"
            checked={checked}
            onChange={handleCheck}
            tabIndex={-1}
            disableRipple
          />
          {type === 'file' ? <InsertDriveFile /> : <Folder />}
          <span>{label}</span>
        </div>
      }
      {...other}
    />
  )
}

export default CustomTreeItem
