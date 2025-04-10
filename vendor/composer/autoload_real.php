<?php

// autoload_real.php @generated by Composer

class ComposerAutoloaderInit47d2b3ff54038bd1a5c4ff876566da2f
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __DIR__ . '/ClassLoader.php';
        }
    }

    /**
     * @return \Composer\Autoload\ClassLoader
     */
    public static function getLoader()
    {
        if (null !== self::$loader) {
            return self::$loader;
        }

        require __DIR__ . '/platform_check.php';

        spl_autoload_register(array('ComposerAutoloaderInit47d2b3ff54038bd1a5c4ff876566da2f', 'loadClassLoader'), true, true);
        self::$loader = $loader = new \Composer\Autoload\ClassLoader(\dirname(__DIR__));
        spl_autoload_unregister(array('ComposerAutoloaderInit47d2b3ff54038bd1a5c4ff876566da2f', 'loadClassLoader'));

        require __DIR__ . '/autoload_static.php';
        call_user_func(\Composer\Autoload\ComposerStaticInit47d2b3ff54038bd1a5c4ff876566da2f::getInitializer($loader));

        $loader->register(true);

        return $loader;
    }
}
