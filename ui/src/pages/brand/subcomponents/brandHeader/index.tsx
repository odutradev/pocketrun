import { ArrowRightIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";

import { Actions, Bar, Container, NavLink, NavList, Top } from "./styles";
import LinkButton from "@components/linkButton";
import BrandMark from "@components/brandMark";
import { brandSections } from "@assets/data";



const BrandHeader = () => (
  <Bar>
    <Container>
      <Top>
        <Link to="/" aria-label="Ir para o painel do PocketRun">
          <BrandMark size={17} />
        </Link>
        <Actions>
          <LinkButton href="#downloads" leftIcon={<DownloadIcon />}>
            Baixar logos
          </LinkButton>
          <LinkButton to="/" variant="primary" rightIcon={<ArrowRightIcon />}>
            Abrir o painel
          </LinkButton>
        </Actions>
      </Top>
      <NavList aria-label="Seções do manual de marca">
        {brandSections.map((section) => (
          <NavLink key={section.id} href={`#${section.id}`}>
            <span>{section.number}</span>
            {section.label}
          </NavLink>
        ))}
      </NavList>
    </Container>
  </Bar>
);

export default BrandHeader;
