import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {


  return (
    <main className="auth">
      {children}
    </main>
  )

  // ...rest of the code remains the same
}

export default Layout;