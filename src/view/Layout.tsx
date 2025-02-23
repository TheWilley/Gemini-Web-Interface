function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className='flex'>{children}</div>
    </div>
  );
}

export default Layout;
