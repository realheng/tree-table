import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.css'
import './index.css'
import { Table } from 'antd'
import dataSource from './data.json'
import {
  generateDataWithPos,
  generateMapAndKey,
  throttle
} from './utils/position'
import { DndProvider, useDrag, useDrop, createDndContext } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const RNDContext = createDndContext(HTML5Backend)

const dataWithPos = generateDataWithPos(dataSource)

const type = 'DragableBodyRow'
const DragableBodyRow = ({
  index,
  moveRow,
  className,
  style,
  record,
  expandedRowKeys,
  setExpandedRowKeys,
  pos,
  ...restProps
}) => {
  const ref = React.useRef()
  const [dropIn, setDropIn] = useState(false)

  const onHover = useCallback(
    throttle((item, monitor) => {
      if (ref.current) {
        const dropOffset = ref.current.getBoundingClientRect()
        const dragOffset = monitor.getSourceClientOffset()

        if (dropOffset && dragOffset) {
          const xdelt = Math.abs(dropOffset.x - dragOffset.x)
          const ydelt = Math.abs(dragOffset.y - dropOffset.y)
          // 计算偏移量
          if (xdelt <= 30 && ydelt <= 20) {
            setDropIn(true)
          } else {
            setDropIn(false)
          }
        }
      }
    }),
    []
  )

  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { pos: dragPos } = monitor.getItem() || {}

      if (dragPos === pos) {
        return {}
      }

      return {
        isOver: monitor.isOver({ shallow: true }),
        dropClassName: ' drop-over'
      }
    },
    drop: item => {
      moveRow(item.pos, pos, dropIn)
    },
    hover: onHover
  })

  const [{ isDragging }, drag] = useDrag({
    item: { type, pos, ref },
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      }
    }
  })

  useEffect(() => {
    if (isDragging && expandedRowKeys.includes(pos)) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== pos))
    }
  }, [isDragging])

  useEffect(() => {
    if (isOver && !expandedRowKeys.includes(pos)) {
      setExpandedRowKeys(expandedRowKeys.concat(pos))
    }
  }, [isOver])

  drop(drag(ref))

  return (
    <tr
      ref={ref}
      className={`${className}${
        isOver ? (dropIn ? dropClassName + ' drop-in' : dropClassName) : ''
      }`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  )
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const DragSortingTable = () => {
  const [data, setData] = useState(dataWithPos)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])

  const components = {
    body: {
      row: DragableBodyRow
    }
  }

  const moveRow = useCallback(
    (dragPos, dropPos, dropIn = false) => {
      // item的key不是pos
      // dropIn为true的话就是将元素设置为第一个子元素
      // drop之后需要重新设置数据分为三部分
      // 第一步是删除dragPos的元素
      // 第二步是添加dragPos到dropPos的后面或者成为dropPos的子元素
      // 第三部是重新计算数据的pos,然后返回一个新的data

      let newData = JSON.parse(JSON.stringify(data))
      const result = generateMapAndKey(newData, 'pos', 'children')
      result.byId = { ...result.byId, '0': { children: newData } }
      result.ids = [...result.ids, '0']

      const { byId } = result

      const dragParentKey = dragPos
        .split('-')
        .slice(0, -1)
        .join('-')

      const dropParentKey = dropPos
        .split('-')
        .slice(0, -1)
        .join('-')

      const dragRelativeIndex = +dragPos.split('-').slice(-1)

      const dropRelativeIndex = +dropPos.split('-').slice(-1)

      // 将drag从原来的父级里面删除
      byId[dragParentKey]['children'][dragRelativeIndex] = undefined
      // 通过dropIn来判断是放进drop里面还是后面
      if (dropIn) {
        if (byId[dropPos].children) {
          byId[dropPos].children.unshift(byId[dragPos])
        } else {
          byId[dropPos].children = [byId[dragPos]]
        }
      } else {
        byId[dropParentKey].children.splice(
          dropRelativeIndex + 1,
          0,
          byId[dragPos]
        )
      }

      byId[dragParentKey]['children'] = byId[dragParentKey]['children'].filter(
        item => !!item
      )
      if (!byId[dragParentKey]['children'].length) {
        delete byId[dragParentKey]['children']
      }
      newData = newData.filter(item => !!item)
      console.log(`drop ${dragPos} ${dropIn ? 'into' : 'behind'} ${dropPos}`)

      console.log('newData: ', newData)

      setData(generateDataWithPos(newData))
      // let curData = newData
      // // drag所在的层级
      // const dragIndex = dragPos.split('-').slice(1)
      // // drop所在的层级
      // const dropIndex = dropPos.split('-').slice(1)
      // let dragItem = null
      // let dropItem = null

      // for (let index = 0; index < dragIndex.length; index++) {
      //   const key = dragIndex[index]
      //   if (index >= dragIndex.length - 1) {
      //     dragItem = curData[key]
      //     curData[key] = null
      //     break
      //   }
      //   curData = (curData[key] && curData[key].children) || []
      // }

      // for (let index = 0; index < dropIndex.length; index++) {
      //   const key = dropIndex[index]
      //   if (index >= dropIndex.length - 1) {
      //     if (dropIn) {
      //       if (curData[key]) {
      //         if (curData[key].children) {
      //           curData[key].children.unshift(dragItem)
      //         } else {
      //           curData[key].children = [dragItem]
      //         }
      //       }
      //     } else {
      //       curData.splice(key + 1, 0, dragItem)
      //     }
      //     break
      //   }
      //   curData = (curData[key] && curData[key].children) || []
      // }
    },
    [data]
  )

  const manager = useRef(RNDContext)

  return (
    <DndProvider manager={manager.current.dragDropManager}>
      <Table
        columns={columns}
        dataSource={data}
        indentSize={30}
        components={components}
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={keys => {
          setExpandedRowKeys(keys)
        }}
        onRow={(record, index) => ({
          index,
          moveRow,
          pos: record.pos,
          expandedRowKeys,
          setExpandedRowKeys
        })}
      />
    </DndProvider>
  )
}

ReactDOM.render(<DragSortingTable />, document.getElementById('container'))
