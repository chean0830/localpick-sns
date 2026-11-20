import { useRoute, matchPath } from './lib/router.js';
import Header from './components/Header.jsx';
import FeedPage from './pages/FeedPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import WritePage from './pages/WritePage.jsx';
import StorePage from './pages/StorePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MyPage from './pages/MyPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SearchPage from './pages/SearchPage.jsx';

const routes = [
  ['/', FeedPage],
  ['/posts/:id', PostDetailPage],
  ['/write', WritePage],
  ['/stores/:id', StorePage],
  ['/login', LoginPage],
  ['/signup', SignupPage],
  ['/mypage', MyPage],
  ['/dashboard/:storeId', DashboardPage],
  ['/search', SearchPage],
];

export default function App() {
  const { path, query } = useRoute();
  let page = <div className="card empty">페이지를 찾을 수 없어요.</div>;
  for (const [pattern, Page] of routes) {
    const params = matchPath(pattern, path);
    if (params) {
      page = <Page params={params} query={query} />;
      break;
    }
  }
  return (
    <>
      <Header />
      {/* key: 경로가 바뀌면 페이지 상태 초기화 */}
      <main key={path}>{page}</main>
    </>
  );
}
