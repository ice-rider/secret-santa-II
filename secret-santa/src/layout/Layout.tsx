import { JSX } from 'solid-js';
import Header from './Header';

interface LayoutProps {
  children: JSX.Element;
}

const Layout = (props: LayoutProps) => {
  return (
    <div class="min-h-screen flex flex-col">
      <Header />
      <main class="flex-grow">
        {props.children}
      </main>
      <footer class="py-6 px-4 text-center text-gray-500 text-sm border-t">
        <p>© {new Date().getFullYear()} Secret Santa. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;