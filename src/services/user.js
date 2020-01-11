import request from '@/utils/request';
export async function query() {
  return request('/_os/index.php');
}
export async function queryCurrent() {
  return request('/_os/index.php');
}

export async function queryMenu() {
  return request('/_os/index.php?com=menu&t=display');
}

export async function queryNotices() {
  return request('/api/notices');
}
