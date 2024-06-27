import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Grid from './grid/grid'
import './grid/grid.css'
import Loginf from './Login/LoginForm'
import './Login/LoginForm.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

    <Loginf>
    </Loginf>
    <Grid>
    </Grid>
  </React.StrictMode>,
)
