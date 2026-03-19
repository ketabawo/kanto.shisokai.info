export type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  cancelled?: boolean;
  image?: string;
};

export const events: Event[] = [
  {
    id: '1st',
    name: '鯨x鯱 Kanto Offline Meeting 2023',
    date: '2023/09/10',
    location: '箱根エコパーキング',
  },
  {
    id: '2nd',
    name: '始祖会 Kanto Offline Meeting 2024 side-A',
    date: '2024/05/12',
    location: '西湘BP下りパーキング',
  },
  {
    id: '3rd',
    name: '始祖会 Kanto Offline Meeting 2024 side-B',
    date: '2024/10/27',
    location: '西湘BP下りパーキング',
  },
  {
    id: '4th',
    name: '始祖会 Kanto Owners Meeting 2025 side-A',
    date: '2025/06/22',
    location: '西湘BP下りパーキング',
  },
  {
    id: '5th',
    name: '始祖会 Kanto Owners Meeting 2025 side-B',
    date: '2025/11/09',
    location: 'ライダーズベースリバティ',
    cancelled: true,
  },
];
