import { type GalleryData, type GalleryItem } from "@/types/gallery";

export const getGalleryData = (): GalleryData => {
  const items: GalleryItem[] = [
    {
      id: "41",
      title: "Mt Puthuk Gragal (Puncak Bidadari) - 21 December 2025",
      src: "/images/gallery/37.jpg",
    },
    {
      id: "40",
      title: "Mt Puthuk Gragal - 21 December 2025",
      src: "/images/gallery/36.jpg",
    },
    {
      id: "39",
      title: "Mt Puthuk Siwur - 20 December 2025",
      src: "/images/gallery/35.jpg",
    },
    {
      id: "38",
      title: "Mt Kelud - 27 October 2025",
      src: "/images/gallery/34.jpg",
    },
    {
      id: "37",
      title: "Ngagel Tirto PDAM Badminton Court - 23 October 2025",
      src: "/images/gallery/33.jpg",
    },
    {
      id: "1",
      title: "Mt Penanggungan - 13 September 2025",
      src: "/images/self/4.jpg",
    },
    {
      id: "2",
      title: "Mt Lorokan - 31 August 2025",
      src: "/images/self/1.jpg",
    },
    {
      id: "3",
      title: "Mt Cendono - 19 July 2025",
      src: "/images/self/3.jpg",
    },
    {
      id: "4",
      title: "Ngalur Beach - 26 July 2025",
      src: "/images/self/2.jpg",
    },
    {
      id: "5",
      title: "Tulungagung - 25 July 2025",
      src: "/images/gallery/1.jpg",
    },
    {
      id: "6",
      title: "Jolotundo Nganjuk - 3 July 2025",
      src: "/images/gallery/2.jpg",
    },
    {
      id: "7",
      title: "Airlangga University B - 18 June 2025",
      src: "/images/gallery/3.jpg",
    },
    {
      id: "8",
      title: "Airlangga University B - 11 May 2025",
      src: "/images/gallery/4.jpg",
    },
    {
      id: "9",
      title: "Srikana Foodwalk - 9 April 2025",
      src: "/images/gallery/5.jpg",
    },
    {
      id: "10",
      title: "All You Can Eat Merr - 21 March 2025",
      src: "/images/gallery/6.jpg",
    },
    {
      id: "11",
      title: "Friend's House - 20 March 2025",
      src: "/images/gallery/7.jpg",
    },
    {
      id: "12",
      title: "Airlangga University B - 13 March 2025",
      src: "/images/gallery/8.jpg",
    },
    {
      id: "13",
      title: "Kaza Mall - 28 December 2024",
      src: "/images/gallery/9.jpg",
    },
    {
      id: "14",
      title: "Airlangga University B - 18 December 2024",
      src: "/images/gallery/10.jpg",
    },
    {
      id: "15",
      title: "Airlangga University B - 6 December 2024",
      src: "/images/gallery/11.jpg",
    },
    {
      id: "16",
      title: "Airlangga University B - 6 December 2024",
      src: "/images/gallery/12.jpg",
    },
    {
      id: "17",
      title: "Airlangga University B - 23 November 2024",
      src: "/images/gallery/13.jpg",
    },
    {
      id: "18",
      title: "Airlangga University B - 21 November 2024",
      src: "/images/gallery/14.jpg",
    },
    {
      id: "19",
      title: "Airlangga University B - 2 November 2024",
      src: "/images/gallery/15.jpg",
    },
    {
      id: "20",
      title: "Airlangga University B - 2 November 2024",
      src: "/images/gallery/16.jpg",
    },
    {
      id: "21",
      title: "WBL - 25 October 2024",
      src: "/images/gallery/17.jpg",
    },
    {
      id: "22",
      title: "Airlangga University B - 12 October 2024",
      src: "/images/gallery/18.jpg",
    },
    {
      id: "23",
      title: "Airlangga University B - 11 October 2024",
      src: "/images/gallery/19.jpg",
    },
    {
      id: "24",
      title: "Airlangga University B - 3 October 2024",
      src: "/images/gallery/20.jpg",
    },
    {
      id: "25",
      title: "Brawijaya University - 1 September 2024",
      src: "/images/gallery/21.jpg",
    },
    {
      id: "26",
      title: "Brawijaya University - 1 September 2024",
      src: "/images/gallery/22.jpg",
    },
    {
      id: "27",
      title: "Telkom Indonesia Divisi Regional 5 - 27 June 2024",
      src: "/images/gallery/23.jpg",
    },
    {
      id: "28",
      title: "Airlangga University B - 24 June 2024",
      src: "/images/gallery/24.jpg",
    },
    {
      id: "29",
      title: "Airlangga University C - 20 June 2024",
      src: "/images/gallery/25.jpg",
    },
    {
      id: "30",
      title: "Airlangga University B - 14 June 2024",
      src: "/images/gallery/26.jpg",
    },
    {
      id: "31",
      title: "Srikana Foodwalk - 14 June 2024",
      src: "/images/gallery/27.jpg",
    },
    {
      id: "32",
      title: "Airlangga University C - 27 April 2024",
      src: "/images/gallery/28.jpg",
    },
    {
      id: "33",
      title: "Airlangga University B - 21 April 2024",
      src: "/images/gallery/29.jpg",
    },
    {
      id: "34",
      title: "Airlangga University B - 21 March 2024",
      src: "/images/gallery/30.jpg",
    },
    {
      id: "35",
      title: "Tunjungan Plaza Mall - 18 March 2024",
      src: "/images/gallery/31.jpg",
    },
    {
      id: "36",
      title: "Ngebel Lake - 18 May 2023",
      src: "/images/gallery/32.jpg",
    },
  ];

  return {
    items,
  };
};

export const searchGalleryItems = (query: string): GalleryItem[] => {
  const data = getGalleryData();
  const lowercaseQuery = query.toLowerCase();

  return data.items.filter((item) =>
    item.title.toLowerCase().includes(lowercaseQuery)
  );
};
