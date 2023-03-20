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

const GitHubRepoBrowser: React.FC<GitHubRepoBrowserProps> = () => {
  const [treeData, setTreeData] = useState<TreeData[]>([])
  const [repoUrl, setRepoUrl] = useState<str>('hieutrluu/gpt4-repo-file-concat')
  const [fetchRepo, setFetchRepo] = useState<boolean>(false)

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

  const pushFetchRepo = () => {
    console.log('run push fetch repo')
    setFetchRepo(true)
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
    console.log('run UseEffect')
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

        return Promise.all(childrenPromises).catch((err) => {
          // return []
          alert(err)
        })
        // .catch(function (err) {
        //   // log that I have an error, return the entire array;
        //   console.log('A promise failed to resolve', err)
        //   // return []
        // })
        // .then(function (arrayOfPromises) {
        //   // full array of resolved promises;
        //   // return []
        // })
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
      setFetchRepo(false)
    }
  }, [fetchRepo])

  // if (treeData.length && fetchRepo) {
  if (treeData.length) {
    return (
      <>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <Button onClick={pushFetchRepo}>Fetch Repo</Button>
        <TreeView
          className="tree-view"
          defaultCollapseIcon={<Folder />}
          defaultExpandIcon={<Folder />}
          defaultEndIcon={<InsertDriveFile />}
        >
          {treeData.map((data) => renderTree(data))}
        </TreeView>
        <Button onClick={getSelect}>Download</Button>
      </>
    )
  } else {
    return (
      <>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <Button onClick={pushFetchRepo}>Fetch Repo</Button>
        <h1> Loading... </h1>
      </>
    )
  }
}

export default GitHubRepoBrowser
