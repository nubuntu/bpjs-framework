<?php
namespace NC\system;
class Html{
	var $dom;
	function __construct($html){
		$this->dom = new \DOMDocument;
		libxml_use_internal_errors(true);
		$this->dom->loadHTML($html);
	}
	function find($tagname){
		$rows =array();
		$elem = $this->dom->getElementsByTagName($tagname);		
		foreach($elem as $el){
			$rows[]=new HtmlElement($el);
		}
		return $rows;
	}
	function getHTML($el){
		return $this->dom->saveHTML($el->getElement());
	}
	
}

class HtmlElement{
	var $el;
	function __construct($el){
		$this->el=$el;
	}
	function __get($attr){
			return $this->el->getAttribute($attr);
	}
	function getElement(){
		return $this->el;
	}
	function getAttributes(){
		$rows=array();
		if ($this->el->hasAttributes()) {
			foreach ($this->el->attributes as $attr) {
				$row = new \stdClass();
				$name = $attr->nodeName;
				$value = $attr->nodeValue;
				$row->$name=$value;
				$rows[]=$row;
			}
		}
		return $rows;
	}

}
?>