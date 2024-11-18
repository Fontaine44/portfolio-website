import { Component } from '@angular/core';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent {
  links = {
    linkedIn: 'https://www.linkedin.com/in/raphael-fontaine/',
    email: 'mailto:raphael.fontaine@mail.mcgill.ca',
    github: 'https://github.com/Fontaine44',
  };

  CVen = 'CV_Raphael_Fontaine_EN.pdf';
  CVfr = 'CV_Raphael_Fontaine_FR.pdf';
}
