export function generateDataWithPos (
  data,
  parentPos = '0',
  childrenkey = 'children'
) {
  const results = []
  const length = data && data.length
  if (!data.length) {
    return results
  }

  for (let index = 0; index < length; index++) {
    const item = data[index]
    const pos = parentPos + '-' + index
    item.pos = pos
    item.key = pos

    if (Array.isArray(item[childrenkey]) && item[childrenkey].length) {
      item[childrenkey] = generateDataWithPos(
        item[childrenkey],
        pos,
        childrenkey
      )
    }
    results.push(item)
  }
  return results
}

export function comparePos (a, b) {
  if (a == null || b == null) {
    return true
  }
  a = a.split('-').join('')
  b = b.split('-').join('')
  return +a > +b
}

export function updateData (data, dragPos, dropPos) {
  // 更新两个节点要分两步
  // 第一步删除dragPos所指代的节点
  // 第二部添加dragPos到dropPos后面
}

export function generateMapAndKey (
  data = [],
  customId = 'fdId',
  customChildren = 'children'
) {
  let byId = {}
  let ids = []
  customId = Array.isArray(customId) ? customId : [customId]

  const length = data.length
  if (length) {
    for (let index = 0; index < length; index++) {
      const item = data[index]

      customId.forEach(key => {
        if (item[key]) {
          byId[item[key]] = item
          ids.push(item[key])
          return
        }
      })

      if (item[customChildren] && item[customChildren].length) {
        const result = generateMapAndKey(
          item[customChildren],
          customId,
          customChildren
        )
        ids = ids.concat(result.ids)
        byId = { ...byId, ...result.byId }
      }
    }
  }

  return {
    byId,
    ids
  }
}

export function debounce (fn, wait = 300) {
  let timeout = null
  return function debounced (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.call(this, ...args)
    }, wait)
  }
}

export function throttle (fn, wait = 150) {
  let timeout = null
  return function debounced (...args) {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn.call(this, ...args)
        timeout = null
      }, wait)
    }
  }
}
