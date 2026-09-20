import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children, headerProps = {} }) {
  return (
    <div className="screen-root">
      <Sidebar />
      <div className="main-content">
        <Header {...headerProps} />
        <div className="page-content page-enter">
          {children}
        </div>
      </div>
    </div>
  );
}
