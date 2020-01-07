
const siteMenu = '_os/index.php?com=menu&t=display&type=1'    // 店铺后台菜单，type=1


// 菜单列表
export async function query (params) {
  return request({
    url: siteMenu,
    method: 'get',
    data: params,
  })
}

// 菜单详情
export async function menuInfo (params) {
  return request({
    url: siteMenu + '&t=info',
    method: 'get',
    data: params,
  })
}

// 新增/编辑
export async function addOrEditMenu (params) {
  return request({
    url: siteMenu + '&t=edit',
    method: 'get',
    data: params,
  })
}

// 删除
export async function deleteMenu (params) {
  return request({
    url: siteMenu + '&t=del',
    method: 'get',
    data: params,
  })
}
