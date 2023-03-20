import React, { useEffect, useState } from 'react'
import { TreeView, TreeItem } from '@mui/lab'
import { CheckBox, Folder, InsertDriveFile } from '@mui/icons-material'
import CustomTreeItem from './CustomTreeItem'
import { Button } from '@mui/material'

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

  const handleCheck = (nodeId: string, checked: boolean) => {
    const updateSelect = (nodes: TreeData[]): TreeData[] => {
      return nodes.map((node) => {
        if (node.path === nodeId) {
          return { ...node, select: checked }
        }
        if (node.children) {
          return { ...node, children: updateSelect(node.children) }
        }
        return node
      })
    }
    setTreeData(updateSelect(treeData))
    console.log(treeData)
  }

  const getSelect = () => {
    // get all nodes that are selected
    const selectNode = treeData.filter((node) => node.select)
    const selectURL = selectNode.map((node) => node.download_url)

    const promises = selectURL.map((file) =>
      fetch(file).then((response) => response.text())
    )
    Promise.all(promises).then((fileContents) => {
      const mergedContent = fileContents.join('\n')
      const blob = new Blob([mergedContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged-files.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
  }

  const renderTree = (nodes: TreeData) => {
    return (
      <CustomTreeItem
        key={nodes.path}
        nodeId={nodes.path}
        label={nodes.name}
        type={nodes.type}
        onCheck={handleCheck}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((child) => renderTree(child))
          : null}
      </CustomTreeItem>
    )
  }

  useEffect(() => {
    let ignore = false
    const fetchContents = async (
      path = ''
    ): Promise<TreeData[] | undefined> => {
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

  if (treeData.length) {
    return (
      <>
        <TreeView
          className="tree-view"
          defaultCollapseIcon={<Folder />}
          defaultExpandIcon={<Folder />}
          defaultEndIcon={<InsertDriveFile />}
        >
          {treeData.map((data) => renderTree(data))}
        </TreeView>
        <button
          // variant="contained"
          onClick={() => {
            console.log(getSelect())
          }}
        >
          Download selected file
        </button>
      </>
    )
  } else {
    return <h1>Loading...</h1>
  }
}

export default GitHubRepoBrowser
