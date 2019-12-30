import request from '@/utils/request';
export async function query() {
  return request('/_os/index.php');
}
export async function queryCurrent() {
  return request('/_os/index.php');
}
export async function queryNotices() {
  return request('/api/notices');
}
