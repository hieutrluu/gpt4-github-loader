import React, { useEffect, useState } from 'react'
import { TreeView, TreeItem } from '@mui/lab'
import { CheckBox, Folder, InsertDriveFile } from '@mui/icons-material'

interface GitHubRepoBrowserProps {
  repoUrl: string
}

interface TreeData {
  path: string
  name: string
  type: string
  select: boolean
  children?: TreeData[]
}

const GitHubRepoBrowser: React.FC<GitHubRepoBrowserProps> = ({ repoUrl }) => {
  const [treeData, setTreeData] = useState<TreeData[]>([])

  const handleCheck = (e: any) => {
    console.log(e)
  }

  const fetchContents = async (path = ''): Promise<TreeData[] | undefined> => {
    const response = await fetch(
      `https://api.github.com/repos/${repoUrl}/contents/${path}`
    )
    const data = await response.json()

    if (Array.isArray(data)) {
      const childrenPromises = data.map(async (item) => {
        if (item.type === 'dir') {
          const children = await fetchContents(item.path)
          return { ...item, children }
        } else {
          return item
        }
      })

      return Promise.all(childrenPromises)
    }
  }

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      const data = await fetchContents()
      if (!ignore) {
        console.log(data)
        setTreeData(data || [])
      }
    }
    fetchData()

    return () => {
      ignore = true
    }
  }, [repoUrl])

  const renderTree = (nodes: TreeData) => {
    return (
      <div>
        <TreeItem
          key={nodes.path}
          nodeId={nodes.path}
          label={nodes.name}
          icon={nodes.type === 'file' ? <InsertDriveFile /> : <Folder />}
        >
          {Array.isArray(nodes.children)
            ? nodes.children.map((child) => renderTree(child))
            : null}
        </TreeItem>
        <CheckBox onChange={handleCheck}></CheckBox>
      </div>
    )
  }

  if (treeData.length) {
    return (
      <TreeView
        className="tree-view"
        defaultCollapseIcon={<Folder />}
        defaultExpandIcon={<Folder />}
        defaultEndIcon={<InsertDriveFile />}
      >
        {treeData.map((data) => renderTree(data))}
      </TreeView>
    )
  } else {
    return <h1>Loading...</h1>
  }
}

export default GitHubRepoBrowser
