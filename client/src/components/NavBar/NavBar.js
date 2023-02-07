import {
  Tab,
  Tabs,
  List,
  Menu,
  AppBar,
  Button,
  Toolbar,
  MenuItem,
  ListItem,
  useTheme,
  IconButton,
  ListItemText,
  useMediaQuery,
  SwipeableDrawer,
} from '@mui/material'
import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { Menu as MenuIcon } from '@mui/icons-material'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import React, { useState, useEffect, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import logo from 'imgs/roshambo.svg'
import { CTX } from 'context/Store'

function ElevationScroll({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })
  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  })
}

const ToolBarMargin = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
  marginBottom: '3em',
  [theme.breakpoints.down('md')]: {
    marginBottom: '2em',
  },
  [theme.breakpoints.down('xs')]: {
    marginBottom: '1.25em',
  },
  [theme.breakpoints.down('xs')]: {
    marginBottom: '.5em',
  },
}))

const NavButton = styled(Button)(({ theme }) => ({
  ...theme.typography.loginLink,
  fontFamily: 'OpenDyslexic',
  borderRadius: '50px',
  marginLeft: '50px',
  marginRight: '25px',
  height: '45px',
}))

const styles = (theme) => ({
  logo: {
    height: '8em',
    [theme.breakpoints.down('md')]: {
      height: '7em',
    },
    [theme.breakpoints.down('xs')]: {
      height: '5.5em',
    },
    [theme.breakpoints.down('xs')]: {
      height: '4.5em',
    },
  },
  tabContainer: {
    marginLeft: 'auto',
    '.Mui-selected': {
      color: 'white',
      opacity: 1,
    },
  },
  tab: {
    ...theme.typography.tab,
    minWidth: 10,
    marginLeft: '25px',
    color: 'white ',
    opacity: 0.8,
  },
  button: {
    ...theme.typography.loginLink,
    borderRadius: '50px',
    marginLeft: '50px',
    marginRight: '25px',
    height: '45px',
  },
  authBtn: {
    background: theme.palette.secondary.main,
    '&:hover': {
      background: theme.palette.secondary.dark,
    },
  },
  logoContainer: {
    padding: 0,
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  menu: {
    backgroundColor: theme.palette.common.blue,
    color: 'white',
    borderRadius: 0,
    '&:Mui-selected': {
      color: 'red !important',
    },
  },
  menuItem: {
    ...theme.typography.tab,
    opacity: 0.7,
    '&:hover': {
      opacity: 1,
    },
  },
  drawerIconContainer: {
    marginLeft: 'auto',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  drawerIcon: {
    height: '50px',
    width: '50px',
    [theme.breakpoints.down('xs')]: {
      height: '35px',
      width: '35px',
    },
  },
  drawer: {
    width: '200px',
    backgroundColor: theme.palette.common.blue,
  },
  drawerItem: {
    ...theme.typography.tab,
    color: 'white',
    paddingLeft: '0',
    textAlign: 'center',
    opacity: 0.7,
    '&:hover': {
      opacity: 1,
    },
  },
  drawerAuthLink: {
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  drawerItemSelected: {
    background: theme.palette.primary.dark,
    '& .MuiListItemText-root': {
      opacity: 1,
    },
  },
  appbar: {
    zIndex: theme.zIndex.modal + 1,
  },
  logout: {
    opacity: '0.5',
    '&:hover': {
      opacity: '1',
    },
  },
})

const menuOptions = [
  { name: 'Battle', link: '/battle', activeIndex: 1, selectedIndex: 0 },
  {
    name: 'Friends',
    link: '/battle/friends',
    activeIndex: 1,
    selectedIndex: 1,
  },
  {
    name: 'Random',
    link: '/battle/random',
    activeIndex: 1,
    selectedIndex: 2,
  },
  {
    name: 'Computer',
    link: '/battle/computer',
    activeIndex: 1,
    selectedIndex: 3,
  },
]

export default function Header() {
  const [{ isLoggedIn, user }, updateState] = useContext(CTX)
  const { id } = user
  const [anchorEl, setAnchorEl] = useState(null)
  const [openMenu, setOpenMenu] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentActiveIndex, setCurrentTabIndex] = useState(0)

  const theme = useTheme()
  const classes = useClasses(styles)
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const matches = useMediaQuery(theme.breakpoints.down('md'))

  const routes = [
    { name: 'Home', link: '/', activeIndex: 0 },
    {
      name: 'Battle',
      link: '/battle',
      activeIndex: 1,
      ariaOwns: (anchorEl) => (anchorEl ? 'simple-menu' : undefined),
      ariaPopup: (anchorEl) => (anchorEl ? true : undefined),
      mouseOver: (event, handleClick) => handleClick(event),
      auth: true,
    },
    { name: 'Profile', link: `/profile/${id}`, activeIndex: 2, auth: true },
    { name: 'Messages', link: '/messages', activeIndex: 3, auth: true },
    { name: 'Forum', link: '/forum', activeIndex: isLoggedIn ? 4 : 1 },
  ]

  const handleChange = (_, newValue) => setCurrentTabIndex(newValue)

  const openModal = () => updateState({ type: 'AUTH_MODAL', payload: true })

  useEffect(() => {
    const routeOptions = [...menuOptions, ...routes]
    routeOptions.forEach((route) => {
      if (window.location.pathname === route.link) {
        if (currentActiveIndex !== route.activeIndex) {
          setCurrentTabIndex(route.activeIndex)
          if (route.selectedIndex && route.selectedIndex !== selectedIndex) {
            setSelectedIndex(route.selectedIndex)
          }
        }
      }
    })
  }, [currentActiveIndex, selectedIndex, routes])

  const handleClick = (e) => {
    setOpenMenu(true)
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setOpenMenu(false)
  }

  const handleMenuItemClick = (e, i) => {
    setAnchorEl(null)
    setOpenMenu(false)
    setSelectedIndex(i)
  }

  const logout = () => updateState({ type: 'LOGOUT' })

  const tabs = (
    <>
      <Tabs
        indicatorColor="primary"
        value={currentActiveIndex}
        onChange={handleChange}
        className={classes.tabContainer}
      >
        {routes.map((route, index) =>
          route.auth && !isLoggedIn ? null : (
            <Tab
              to={route.link}
              component={Link}
              label={route.name}
              className={classes.tab}
              key={`${route}${index}`}
              tabIndex={route.activeIndex}
              aria-owns={route.ariaOwns && route.ariaOwns(anchorEl)}
              aria-haspopup={route.ariaPopup && route.ariaPopup(anchorEl)}
              onMouseOver={(e) => route.mouseOver && route.mouseOver(e, handleClick)}
            />
          )
        )}
      </Tabs>
      {isLoggedIn && (
        <Button
          color="primary"
          onClick={logout}
          variant="contained"
          classes={{ root: classes.button }}
          className={`${classes.button} ${classes.logout}`}
        >
          Log out
        </Button>
      )}
      {!isLoggedIn && (
        <NavButton color="secondary" variant="contained" onClick={openModal}>
          Sign In
        </NavButton>
      )}
      <Menu
        keepMounted
        elevation={0}
        id="simple-menu"
        anchorEl={anchorEl}
        onClose={handleClose}
        style={{ zIndex: 1302 }}
        open={Boolean(openMenu)}
        classes={{ paper: classes.menu }}
        MenuListProps={{ onMouseLeave: handleClose }}
      >
        {menuOptions.map((option, i) => (
          <MenuItem
            component={Link}
            to={option.link}
            key={option.link}
            onClick={(e) => {
              handleClose()
              setCurrentTabIndex(1)
              handleMenuItemClick(e, i)
            }}
            classes={{ root: classes.menuItem }}
            selected={i === selectedIndex && currentActiveIndex === 1}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )

  const drawer = (
    <>
      <SwipeableDrawer
        disableDiscovery={iOS}
        open={openDrawer}
        disableBackdropTransition={!iOS}
        onOpen={() => setOpenDrawer(true)}
        classes={{ paper: classes.drawer }}
        onClose={() => setOpenDrawer(false)}
      >
        <ToolBarMargin />
        <List disablePadding>
          {routes.map((route) =>
            route.auth && !isLoggedIn ? null : (
              <ListItem
                divider
                to={route.link}
                component={Link}
                key={`${route}${route.activeIndex}`}
                onClick={() => {
                  setOpenDrawer(false)
                  setCurrentTabIndex(route.activeIndex)
                }}
                className={
                  currentActiveIndex === route.activeIndex ? classes.drawerItemSelected : ''
                }
              >
                <ListItemText className={classes.drawerItem} disableTypography>
                  {route.name}
                </ListItemText>
              </ListItem>
            )
          )}
          {isLoggedIn ? (
            <ListItem divider classes={{ root: classes.drawerAuthLink }}>
              <ListItemText disableTypography className={classes.drawerItem} onClick={logout}>
                Log out
              </ListItemText>
            </ListItem>
          ) : (
            <ListItem
              divider
              onClick={() => {
                openModal()
                setOpenDrawer(false)
                setCurrentTabIndex(5)
              }}
              className={classes.drawerAuthLink}
            >
              <ListItemText className={classes.drawerItem} disableTypography>
                Sign In
              </ListItemText>
            </ListItem>
          )}
        </List>
      </SwipeableDrawer>
      <IconButton
        disableRipple
        className={classes.drawerIconContainer}
        onClick={() => setOpenDrawer(!openDrawer)}
      >
        <MenuIcon className={classes.drawerIcon} />
      </IconButton>
    </>
  )

  return (
    <>
      <ElevationScroll>
        <AppBar className={classes.appbar}>
          <Toolbar disableGutters>
            <Button
              to="/"
              disableRipple
              component={Link}
              className={classes.logoContainer}
              onClick={() => setCurrentTabIndex(0)}
            >
              <img className={classes.logo} src={logo} alt="three hands logo" />
            </Button>
            {matches ? drawer : tabs}
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <ToolBarMargin />
    </>
  )
}
