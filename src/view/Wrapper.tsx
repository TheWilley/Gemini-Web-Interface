function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className='text-text min-h-screen bg-background'>{children}</div>;
}

export default Wrapper;
