import React from 'react'
import Sidebar from './Sidebar'
import UpdatePrompt from './UpdatePrompt'

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <UpdatePrompt />
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}

export default Layout
