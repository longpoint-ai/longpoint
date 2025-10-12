import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@longpoint/ui/components/sidebar';
import { HomeIcon, ImagePlayIcon, Settings2Icon } from 'lucide-react';
import { Link } from 'react-router-dom';

const sidebarItems = [
  {
    label: 'Home',
    url: '/',
    icon: HomeIcon,
  },
  {
    label: 'Library',
    url: '/library',
    icon: ImagePlayIcon,
  },
  {
    label: 'Settings',
    url: '/settings',
    icon: Settings2Icon,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Longpoint Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
