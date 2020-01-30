import request from '@/utils/request';
import qs from 'qs'



// 菜单列表
export async function query (params) {
  return request('/_os/index.php?com=menu&t=display&app_id=10001', {
    method: 'get',
    data: qs.stringify(params),
  });
}

// 菜单列表
export async function menuInfo (params) {
  return request('/_os/index.php?com=menu&t=info', {
    method: 'post',
    data: qs.stringify(params),
  });
}

// 新增/编辑
export async function addOrEditMenu (params) {
  return request('/_os/index.php?com=menu&t=edit', {
    method: 'post',
    data: qs.stringify(params),
  });
}



// 删除
export async function deleteMenu (params) {
  return request('/_os/index.php?com=menu&t=del', {
    method: 'post',
    data: qs.stringify(params),
  });
}
