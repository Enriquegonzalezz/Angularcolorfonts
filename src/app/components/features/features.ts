import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.html',
  styleUrls: ['./features.css']
})
export class FeaturesComponent {
  features: FeatureProps[] = [
    {
      title: "Diseño responsivo",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.",
      image: "assets/growth.png",
    },
    {
      title: "interface intuitiva",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.",
      image: "assets/reflecting.png",
    },
    {
      title: "ux amigable",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.",
      image: "assets/looking-ahead.png",
    },
  ];

  featureList: string[] = [
    "Dark/Light theme",
    "Reviews",
    "Features",
    "Pricing",
    "Contact form",
    "Our team",
    "Responsive design",
    "Newsletter",
    "Minimalist",
  ];
}
