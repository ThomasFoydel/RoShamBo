import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  makeStyles,
  SwipeableDrawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { Link } from 'react-router-dom';
import logo from 'imgs/roshambo.svg';
import { CTX } from 'context/Store';

function ElevationScroll({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });
  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

const useStyles = makeStyles((theme) => ({
  toolbarMargin: {
    ...theme.mixins.toolbar,
    marginBottom: '3em',
    [theme.breakpoints.down('md')]: {
      marginBottom: '2em',
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: '1.25em',
    },
  },
  logo: {
    height: '8em',
    [theme.breakpoints.down('md')]: {
      height: '7em',
    },
    [theme.breakpoints.down('xs')]: {
      height: '5.5em',
    },
  },
  tabContainer: {
    marginLeft: 'auto',
  },
  tab: {
    ...theme.typography.tab,
    minWidth: 10,
    marginLeft: '25px',
  },
  button: {
    ...theme.typography.loginLink,
    borderRadius: '50px',
    marginLeft: '50px',
    marginRight: '25px',
    height: '45px',
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
  },
  drawer: {
    backgroundColor: theme.palette.common.blue,
  },
  drawerItem: {
    ...theme.typography.tab,
    color: 'white',
    opacity: 0.7,
  },
  drawerAuthLink: {
    backgroundColor: theme.palette.common.magenta,
  },
  drawerItemSelected: {
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
}));

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
];

export default function Header() {
  const classes = useStyles();
  const theme = useTheme();
  const [appState, updateState] = useContext(CTX);
  const {
    isLoggedIn,
    user: { id },
  } = appState;
  const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [openDrawer, setOpenDrawer] = useState(false);
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const routes = [
    { name: 'Home', link: '/', activeIndex: 0 },
    {
      name: 'Battle',
      link: '/battle',
      activeIndex: 1,
      ariaOwns: (anchorEl) => (anchorEl ? 'simple-menu' : undefined),
      ariaPopup: (anchorEl) => (anchorEl ? true : undefined),
      mouseOver: (event, handleClick) => handleClick(event),
    },

    { name: 'Profile', link: `/profile/${id}`, activeIndex: 2 },
    { name: 'Messages', link: '/messages', activeIndex: 3 },
    { name: 'Forum', link: '/forum', activeIndex: 4 },
  ];

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  const toggleModal = () => {
    updateState({ type: 'TOGGLE_AUTH_MODAL' });
  };

  useEffect(() => {
    [...menuOptions, ...routes].forEach((route) => {
      if (window.location.pathname === route.link) {
        if (value !== route.activeIndex) {
          setValue(route.activeIndex);
          if (route.selectedIndex && route.selectedIndex !== selectedIndex) {
            setSelectedIndex(route.selectedIndex);
          }
        }
      }
    });
  }, [value, selectedIndex, routes]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    setOpenMenu(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  const handleMenuItemClick = (e, i) => {
    setAnchorEl(null);
    setOpenMenu(false);
    setSelectedIndex(i);
  };

  const tabs = (
    <>
      <Tabs
        className={classes.tabContainer}
        value={value}
        onChange={handleChange}
        indicatorColor='primary'
      >
        {routes.map((route, index) => (
          <Tab
            key={`${route}${index}`}
            className={classes.tab}
            component={Link}
            to={route.link}
            label={route.name}
            aria-owns={route.ariaOwns && route.ariaOwns(anchorEl)}
            aria-haspopup={route.ariaPopup && route.ariaPopup(anchorEl)}
            onMouseOver={(e) =>
              route.mouseOver && route.mouseOver(e, handleClick)
            }
          />
        ))}
      </Tabs>
      {isLoggedIn && (
        <Button
          variant='contained'
          color='primary'
          className={`${classes.button} ${classes.logout}`}
          onClick={() => {
            updateState({ type: 'LOGOUT' });
          }}
        >
          Log out
        </Button>
      )}
      {!isLoggedIn && (
        <Button
          variant='contained'
          color='secondary'
          onClick={toggleModal}
          className={classes.button}
        >
          Sign In
        </Button>
      )}
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        open={Boolean(openMenu)}
        onClose={handleClose}
        classes={{ paper: classes.menu }}
        MenuListProps={{ onMouseLeave: handleClose }}
        elevation={0}
        style={{ zIndex: 1302 }}
        keepMounted
      >
        {menuOptions.map((option, i) => (
          <MenuItem
            key={option.link}
            component={Link}
            to={option.link}
            classes={{ root: classes.menuItem }}
            onClick={(e) => {
              handleMenuItemClick(e, i);
              setValue(1);
              handleClose();
            }}
            selected={i === selectedIndex && value === 1}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  const drawer = (
    <>
      <SwipeableDrawer
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onOpen={() => setOpenDrawer(true)}
        classes={{ paper: classes.drawer }}
      >
        <div className={classes.toolbarMargin} />
        <List disablePadding>
          {routes.map((route) => (
            <ListItem
              key={`${route}${route.activeIndex}`}
              onClick={() => {
                setOpenDrawer(false);
                setValue(route.activeIndex);
              }}
              divider
              button
              component={Link}
              to={route.link}
              selected={value === route.activeIndex}
              classes={{ selected: classes.drawerItemSelected }}
            >
              <ListItemText className={classes.drawerItem} disableTypography>
                {route.name}
              </ListItemText>
            </ListItem>
          ))}
          {isLoggedIn ? (
            <ListItem
              divider
              button
              classes={{
                root: classes.drawerAuthLink,
              }}
            >
              <ListItemText
                onClick={() => {
                  updateState({ type: 'LOGOUT' });
                }}
                className={classes.drawerItem}
                disableTypography
              >
                Log out
              </ListItemText>
            </ListItem>
          ) : (
            <ListItem
              onClick={() => {
                setValue(5);
                setOpenDrawer(false);
              }}
              divider
              button
              classes={{
                root: classes.drawerAuthLink,
                selected: classes.drawerItemSelected,
              }}
              selected={value === 5}
            >
              <ListItemText
                onClick={toggleModal}
                className={classes.drawerItem}
                disableTypography
              >
                Sign In
              </ListItemText>
            </ListItem>
          )}
        </List>
      </SwipeableDrawer>
      <IconButton
        className={classes.drawerIconContainer}
        onClick={() => setOpenDrawer(!openDrawer)}
        disableRipple
      >
        <MenuIcon className={classes.drawerIcon} />
      </IconButton>
    </>
  );

  return (
    <>
      <ElevationScroll>
        <AppBar className={classes.appbar}>
          <Toolbar disableGutters>
            <Button
              disableRipple
              onClick={() => setValue(0)}
              component={Link}
              to='/'
              className={classes.logoContainer}
            >
              <img className={classes.logo} src={logo} alt='three hands logo' />
            </Button>
            {matches ? drawer : tabs}
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <div className={classes.toolbarMargin} />
    </>
  );
}
