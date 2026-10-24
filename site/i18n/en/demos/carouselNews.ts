import type ja from '../../ja/demos/carouselNews';

export default {
  label: 'Announcements',
  dashboardTitle: 'New dashboard',
  dashboardBody: 'Revenue, sign-ups and usage rates on a single screen. Step through the chart points with the keyboard and have their values read out.',
  dashboardAction: 'Take a look',
  invoicesTitle: 'Download invoices in bulk',
  invoicesBody: 'The invoices for the months you choose, in a single ZIP. One handoff to accounting is all it takes.',
  invoicesAction: 'See how it works',
  invitesTitle: 'Invite members in bulk',
  invitesBody: 'Just paste the email addresses. You can choose their roles right there, too.',
  invitesAction: 'Invite',
  comments: {
    autoplay: 'Moves on every 6 seconds. The stop button comes first, and it also stops while the pointer or focus is on it',
  },
} satisfies typeof ja;
